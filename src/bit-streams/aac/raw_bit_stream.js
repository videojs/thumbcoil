import {ExpGolombDecoder, ExpGolombEncoder} from '../../lib/exp-golomb-string';
import {start, startArray, data, debug, verify, newObj} from '../../lib/combinators';
import {list} from '../../lib/list';
import {when, each, inArray, equals, some, every, not, whileMoreData, gt} from '../../lib/conditionals';
import {ue, u, se, val, byteAlign} from '../../lib/data-types';
import {
  typedArrayToBitString,
  bitStringToTypedArray,
  appendRBSPTrailingBits
} from '../../lib/rbsp-utils';
import {swb_offset_long_window, swb_offset_short_window} from './scale-factor-bands';
import {readCodebookValue, scaleFactorCB, spectrumCB} from './codebooks';

const ONLY_LONG_SEQUENCE = 0;
const LONG_START_SEQUENCE = 1;
const EIGHT_SHORT_SEQUENCE = 2;
const LONG_STOP_SEQUENCE = 3;

const QUAD_LEN = 4;
const PAIR_LEN = 2;
const ZERO_HCB = 0;
const FIRST_PAIR_HCB = 5;
const ESC_HCB = 11;
const NOISE_HCB = 13;
const INTENSITY_HCB2 = 14;
const INTENSITY_HCB = 15;
const ESC_FLAG = 16;

const codebookInfo = [
// [unsigned, tuples, LAV]
  [null, null, 0], // ZERO_HCB
  [0, 4, 1],
  [0, 4, 1],
  [1, 4, 2],
  [1, 4, 2],
  [0, 2, 4], // FIRST_PAIR_HCB
  [0, 2, 4],
  [1, 2, 7],
  [1, 2, 7],
  [1, 2, 12],
  [1, 2, 12],
  [1, 2, 16] // ESC_HCB
];

const PRED_SFB_MAX = [
  33,
  33,
  38,
  40,
  40,
  40,
  41,
  41,
  37,
  37,
  37,
  34
];

const bit_set = function (val, bit) {
  return (1 << bit) & val;
}

const doPostIcsInfoCalculation = {
  decode: ({expGolomb, output, options}) => {
    let fs_index = options.sampling_frequency_index;

    if (output.window_sequence === EIGHT_SHORT_SEQUENCE) {
      output.num_windows = 8;
      output.num_window_groups = 1;
      output.window_group_length = [1];
      output.num_swb = swb_offset_long_window[fs_index].length - 1;
      output.sect_sfb_offset = [];
      output.swb_offset = [];

      for (let i = 0; i <= output.num_swb; i++) {
        output.swb_offset[i] = swb_offset_short_window[fs_index][i];
      }

      for (let i = 0; i < output.num_windows - 1; i++) {
        if (bit_set(output.scale_factor_grouping, 6 - i) === 0) {
          output.num_window_groups += 1;
          output.window_group_length[output.num_window_groups - 1] = 1;
        } else {
         output.window_group_length[output.num_window_groups - 1] += 1;
        }
      }

      /* preparation of sect_sfb_offset for short blocks */
      for (let g = 0; g < output.num_window_groups; g++) {
        let sect_sfb = 0;
        let offset = 0;
        output.sect_sfb_offset[g] = [];
        for (let i = 0; i < output.max_sfb; i++) {
          let width = swb_offset_short_window[fs_index][i + 1] - swb_offset_short_window[fs_index][i];
          width *= output.window_group_length[g];
          output.sect_sfb_offset[g][sect_sfb++] = offset;
          offset += width;
        }
        output.sect_sfb_offset[g][sect_sfb] = offset;
      }
    } else {
      output.num_windows = 1;
      output.num_window_groups = 1;
      output.window_group_length = [1];
      output.num_swb = swb_offset_long_window[fs_index].length - 1;
      output.sect_sfb_offset = [[]];
      output.swb_offset = [];

      for (let i = 0; i <= output.max_sfb; i++) {
        output.sect_sfb_offset[0][i] = swb_offset_long_window[fs_index][i];
        output.swb_offset[i] = swb_offset_long_window[fs_index][i];
      }
    }

    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const sectionData = {
  decode: ({expGolomb, output, options}) => {
    let bits = 5;
    if (output.window_sequence === EIGHT_SHORT_SEQUENCE) {
      bits = 3;
    }

    let sect_esc_val = (1 << bits) - 1;
    output.sect_cb = [];
    output.sect_start = [];
    output.sect_end = [];
    output.sfb_cb = [];
    output.num_sec = [];
    for (let g = 0; g < output.num_window_groups; g++) {
      let k = 0;
      let i = 0;

      output.sect_cb[g] = [];
      output.sect_start[g] = [];
      output.sect_end[g] = [];
      output.sfb_cb[g] = [];

      while (k < output.max_sfb) {
        output.sect_cb[g][i] = expGolomb.readBits(4);
        let sect_len = 0;
        let sect_len_part = 0;

        do {
          sect_len_part = expGolomb.readBits(bits);
          sect_len += sect_len_part;
        } while(sect_len_part === sect_esc_val);

        output.sect_start[g][i] = k;
        output.sect_end[g][i] = k + sect_len;
        for (let sfb = k; sfb < k + sect_len; sfb++) {
          output.sfb_cb[g][sfb] = output.sect_cb[g][i];
        }
        k += sect_len;
        i++;
      }
      output.num_sec[g] = i;
    }

    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const scaleFactorData = {
  decode: ({expGolomb, output, options}) => {
    output.scale_factors =[];

    for (let g = 0; g < output.num_window_groups; g++) {
      for (let sfb = 0; sfb < output.max_sfb; sfb++) {
        if (output.sfb_cb[g][sfb] !== ZERO_HCB) {
          output.scale_factors.push(readCodebookValue(scaleFactorCB, expGolomb));
        }
      }
    }
    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const tnsData = {
  decode: ({expGolomb, output, options}) => {
    output.n_filt = [];
    output.coef_res = [];
    output.length = [];
    output.order = [];
    output.direction = [];
    output.coef_compress = [];
    output.coef = [];

    for (let w = 0; w < output.num_windows; w++) {
      output.n_filt[w] = expGolomb.readBits(2);
      output.length[w] = [];
      output.order[w] = [];
      output.direction[w] = [];
      output.coef_compress[w] = [];
      output.coef[w] = [];

      if (output.n_filt[w]) {
        output.coef_res[w] = expGolomb.readBits(1);
      }

      for (let filt = 0; filt < output.n_filt[w]; filt++) {
        output.length[w][filt] = expGolomb.readBits(6);
        output.order[w][filt] = expGolomb.readBits(5);
        if (output.order[w][filt]) {
          output.direction[w][filt] = expGolomb.readBits(1);
          output.coef_compress[w][filt] = expGolomb.readBits(1);
          output.coef[w][filt] = [];
          for (let i = 0; i < output.order[w][filt]; i++) {
            output.coef[w][filt][i] = expGolomb.readBits(output.coef_res[w] + 3);
          }
        }
      }
    }

    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const gainControlData = {
  decode: ({expGolomb, output, options}) =>{
    output.max_band = expGolomb.readBits(2);
    output.adjust_num = [];
    output.alevcode = [];
    output.aloccode = [];

    if (output.window_sequence === ONLY_LONG_SEQUENCE) {
      for (let bd = 1; bd <= output.max_band; bd++) {
        output.adjust_num[bd] = [];
        output.alevcode[bd] = [];
        output.aloccode[bd] = [];
        for (let wd = 0; wd < 1; wd++) {
          output.adjust_num[bd][wd] = expGolomb.readBits(3);
          output.alevcode[bd][wd] = [];
          output.aloccode[bd][wd] = [];
         for (let ad = 0; ad < output.adjust_num[bd][wd]; ad++) {
            output.alevcode[bd][wd][ad] =  expGolomb.readBits(4);
            output.aloccode[bd][wd][ad] =  expGolomb.readBits(5);
          }
        }
      }
    } else if (output.window_sequence === LONG_START_SEQUENCE) {
      for (let bd = 1; bd <= output.max_band; bd++) {
        output.adjust_num[bd] = [];
        output.alevcode[bd] = [];
        output.aloccode[bd] = [];
        for (let wd = 0; wd < 2; wd++) {
          output.adjust_num[bd][wd] = expGolomb.readBits(3);
          output.alevcode[bd][wd] = [];
          output.aloccode[bd][wd] = [];
         for (let ad = 0; ad < output.adjust_num[bd][wd]; ad++) {
            output.alevcode[bd][wd][ad] =  expGolomb.readBits(4);

            if (wd === 0) {
              output.aloccode[bd][wd][ad] =  expGolomb.readBits(4);
            } else {
              output.aloccode[bd][wd][ad] =  expGolomb.readBits(2);
            }
          }
        }
      }
    } else if (output.window_sequence === EIGHT_SHORT_SEQUENCE) {
      for (let bd = 1; bd <= output.max_band; bd++) {
        output.adjust_num[bd] = [];
        output.alevcode[bd] = [];
        output.aloccode[bd] = [];
        for (let wd = 0; wd < 8; wd++) {
          output.adjust_num[bd][wd] = expGolomb.readBits(3);
          output.alevcode[bd][wd] = [];
          output.aloccode[bd][wd] = [];
         for (let ad = 0; ad < output.adjust_num[bd][wd]; ad++) {
            output.alevcode[bd][wd][ad] =  expGolomb.readBits(4);
            output.aloccode[bd][wd][ad] =  expGolomb.readBits(2);
          }
        }
      }
    } else if (output.window_sequence === LONG_STOP_SEQUENCE) {
      for (let bd = 1; bd <= output.max_band; bd++) {
        output.adjust_num[bd] = [];
        output.alevcode[bd] = [];
        output.aloccode[bd] = [];
        for (let wd = 0; wd < 2; wd++) {
          output.adjust_num[bd][wd] = expGolomb.readBits(3);
          output.alevcode[bd][wd] = [];
          output.aloccode[bd][wd] = [];
         for (let ad = 0; ad < output.adjust_num[bd][wd]; ad++) {
            output.alevcode[bd][wd][ad] =  expGolomb.readBits(4);

            if (wd === 0) {
              output.aloccode[bd][wd][ad] =  expGolomb.readBits(4);
            } else {
              output.aloccode[bd][wd][ad] =  expGolomb.readBits(5);
            }
          }
        }
      }
    }
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const decodeHCode = function (idx, sect_cb) {
  let [unsigned, dim, lav] = codebookInfo[sect_cb];
  let mod, off;
  let v;
  let vals = [];

  if (unsigned) {
    mod = lav + 1;
    off = 0;
  } else {
    mod = 2 * lav + 1;
    off = lav;
  }

  if (dim === 4) {
    vals.push(v = parseInt(idx / (mod * mod * mod)) - off);
    idx -= (v + off) * (mod * mod * mod);
    vals.push(v = parseInt(idx / (mod * mod)) - off);
    idx -= (v + off) * (mod * mod);
    vals.push(v = parseInt(idx / mod) - off);
    idx -= (v + off) * mod;
    vals.push(idx - off);
  } else {
    vals.push(v = parseInt(idx / mod) - off);
    idx -= (v + off) * mod
    vals.push(idx - off);
  }
  return vals;
};

const getSignBits = function (vals, sect_cb) {
  let [unsigned] = codebookInfo[sect_cb];

  if (!unsigned) {
    return 0;
  } else {
    return vals.filter(v => v !== 0).length;
  }
};

const readEscValue = function (expGolomb) {
  let bits = expGolomb.bitReservoir;
  let N = 0;

  for (N = 0; N < bits.length; N++) {
    if (bits[N] === '0') {
      let esc = expGolomb.readBits(N + 1);
      let val = expGolomb.readBits(N + 4);

      return Math.pow(2, N + 4) + val;
    }
  }
};

const spectralData = {
  decode: ({expGolomb, output, options}) => {
    output.spectral_data = [];
    for (let g = 0; g < output.num_window_groups; g++) {
      output.spectral_data[g] = [];
      for (let i = 0; i < output.num_sec[g]; i++) {
        let sect_cb = output.sect_cb[g][i];
        let start_k = output.sect_sfb_offset[g][output.sect_start[g][i]];
        let end_k = output.sect_sfb_offset[g][output.sect_end[g][i]];

        if (sect_cb !== ZERO_HCB && sect_cb <= ESC_HCB) {
          for (let k = start_k; k < end_k;) {
            let idx = readCodebookValue(spectrumCB[sect_cb], expGolomb);
            let vals = decodeHCode(idx, sect_cb);
            let numBits = getSignBits(vals, sect_cb);

            // Read sign bits
            let bits = expGolomb.readRawBits(numBits);

            output.spectral_data[g][k] = vals[0];
            output.spectral_data[g][k + 1] = vals[1];
            if (sect_cb < FIRST_PAIR_HCB) {
              output.spectral_data[g][k + 2] = vals[2];
              output.spectral_data[g][k + 3] = vals[3];
              k += QUAD_LEN;
            } else {
              if (sect_cb === ESC_HCB) {
                if (vals[0] === ESC_FLAG) {
                  output.spectral_data[g][k] = readEscValue(expGolomb);
                }
                if (vals[1] === ESC_FLAG) {
                  output.spectral_data[g][k + 1] = readEscValue(expGolomb);
                }
              }
              k += PAIR_LEN;
            }
          }
        }
      }
    }

    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const readMsMask ={
  decode: ({expGolomb, output, options}) => {
    output.ms_used = [];

    for (let g = 0; g < output.num_window_groups; g++) {
      output.ms_used[g] = [];
      for (let sfb = 0; sfb < output.max_sfb; sfb++) {
        output.ms_used[g][sfb] = expGolomb.readBits(1);
      }
    }

    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const icsInfo = list([
  data('ics_reserved_bit', u(1)),
  data('window_sequence', u(2)),
  data('window_shape', u(1)),
  when(equals('window_sequence', EIGHT_SHORT_SEQUENCE),
    data('max_sfb', u(4)),
    data('scale_factor_grouping', u(7))),
  when(not(equals('window_sequence', EIGHT_SHORT_SEQUENCE)),
    data('max_sfb', u(6)),
    data('predictor_data_present', u(1)),
    when(equals('predictor_data_present', 1),
      data('predictor_reset', u(1)),
      when(equals('predictor_reset', 1), data('predictor_reset_group_number', u(5))),
      each((index, options) => {
          return index < Math.min(options.max_sfb, PRED_SFB_MAX[options.sampling_frequency_index]);
        },
        data('prediction_used[]', u(1))))),
  doPostIcsInfoCalculation
]);

const pulseData = list([
  data('number_pulse', u(2)),
  data('pulse_start_sfb', u(6)),
  each((index, options) => {
      return index <= options.number_pulse;
    },
    data('pulse_offset[]', u(5)),
    data('pulse_amp[]', u(4)))
]);

const individualChannelStream = list([
  data('global_gain', u(8)),
  when(not(equals('common_window', 1)),
    icsInfo),
  sectionData,
  scaleFactorData,
  data('pulse_data_present', u(1)),
  when(equals('pulse_data_present', 1),
    pulseData),
  data('tns_data_present', u(1)),
  when(equals('tns_data_present', 1),
    tnsData),
  data('gain_control_data_present', u(1)),
  when(equals('gain_control_data_present', 1),
    gainControlData),
  spectralData
]);

const noop = {decode:()=>{}};

const singleChannelElem = list([
  data('element_instance_tag', u(4)),
  individualChannelStream
]);

const channelPairElem = list([
  data('element_instance_tag', u(4)),
  data('common_window', u(1)),
  when(equals('common_window', 1),
    icsInfo,
    data('ms_mask_present', u(2)),
    when(equals('ms_mask_present', 1), readMsMask)),
  newObj('ics_1',
    data('type', val('individual_channel_stream')),
     individualChannelStream),
  newObj('ics_2',
    data('type', val('individual_channel_stream')),
     individualChannelStream),
]);

const couplingChannelElem = noop;

const lfeChannelElem = list([
  data('element_instance_tag', u(4)),
  individualChannelStream
]);

const dataStreamElem = list([
  data('element_instance_tag', u(4)),
  data('data_byte_align_flag', u(1)),
  data('count', u(8)),
  data('esc_count', val(0)),
  when(equals('count', 255),
    data('esc_count', u(8))),
  when(equals('data_byte_align_flag', 1),
    data('byte_alignment_bits', byteAlign)),
  each((index, options) => {
      return index < options.count + options.esc_count;
    },
    data('data_stream_byte[]', u(8)))
]);

const programConfigElem = list([
  data('element_instance_tag', u(4)),
  data('profile', u(2)),
  data('sampling_frequency_index', u(4)),
  data('num_front_channel_elements', u(4)),
  data('num_side_channel_elements', u(4)),
  data('num_back_channel_elements', u(4)),
  data('num_lfe_channel_elements', u(2)),
  data('num_assoc_data_elements', u(3)),
  data('num_valid_cc_elements', u(4)),
  data('mono_mixdown_present', u(1)),
  when(equals('mono_mixdown_present', 1),
    data('mono_mixdown_element_number', u(4))),
  data('stereo_mixdown_present', u(1)),
  when(equals('stereo_mixdown_present', 1),
    data('stereo_mixdown_element_number', u(4))),
  data('matrix_mixdown_idx_present', u(1)),
  when(equals('matrix_mixdown_idx_present', 1),
    data('matrix_mixdown_idx', u(2)),
    data('pseudo_surround_enable', u(1))),
  each((index, options) => {
      return index < options.num_front_channel_elements;
    },
    data('front_element_is_cpe[]', u(1)),
    data('front_element_tag_select[]', u(4))),
  each((index, options) => {
      return index < options.num_side_channel_elements;
    },
    data('side_element_is_cpe[]', u(1)),
    data('side_element_tag_select[]', u(4))),
  each((index, options) => {
      return index < options.num_back_channel_elements;
    },
    data('back_element_is_cpe[]', u(1)),
    data('back_element_tag_select[]', u(4))),
  each((index, options) => {
      return index < options.num_lfe_channel_elements;
    },
    data('lfe_element_tag_select[]', u(4))),
  each((index, options) => {
      return index < options.num_assoc_data_elements;
    },
    data('assoc_data_element_tag_select[]', u(4))),
  each((index, options) => {
      return index < options.num_valid_cc_elements;
    },
    data('cc_element_is_ind_sw[]', u(1)),
    data('valid_cc_element_tag_select[]', u(4))),
  data('byte_alignment_bits', byteAlign()),
  data('comment_field_bytes', u(8)),
  each((index, options) => {
      return index < options.comment_field_bytes;
    },
    data('comment_field_data[]', u(8)))
]);

const fillElem = list([
  data('count', u(4)),
  data('esc_count', val(0)),
  when(equals('count', 15),
    data('esc_count', u(8))),
  each((index, options) => {
    return index < options.count + options.esc_count - 1;
  },
  data('fill_byte[]', u(8)))
]);

const endElem = list([
  data('byte_alignment_bits', byteAlign()),
  verify('aac')
]);

export const aacCodec = start('elements', whileMoreData(
  newObj('elements[]',
    data('id_syn_ele', u(3)),
    when(equals('id_syn_ele', 0),
      data('type', val('single_channel_element')),
      singleChannelElem),
    when(equals('id_syn_ele', 1),
      data('type', val('channel_pair_element')),
      channelPairElem),
    when(equals('id_syn_ele', 2),
      data('type', val('coupling_channel_element')),
      couplingChannelElem),
    when(equals('id_syn_ele', 3),
      data('type', val('lfe_channel_element')),
      lfeChannelElem),
    when(equals('id_syn_ele', 4),
      data('type', val('data_stream_element')),
      dataStreamElem),
    when(equals('id_syn_ele', 5),
      data('type', val('program_config_element')),
      programConfigElem),
    when(equals('id_syn_ele', 6),
      data('type', val('fill_element')),
      fillElem),
    when(equals('id_syn_ele', 7),
      data('type', val('end')),
      endElem))));

const adts_error_check = when(equals('protection_absent', 0), data('crc_check', u(16)));

const adts_header_error_check = list([
  when(equals('protection_absent', 0),
    each((index, options, output) => {
      return index < output.number_of_raw_data_blocks_in_frame;
    },
    data('raw_data_block_position[]', u(16)))),
  adts_error_check
]);

export const adtsCodec = start('adts_frame',
  data('sync_word', u(12)),
  data('ID', u(1)),
  data('layer', u(2)),
  data('protection_absent', u(1)),
  data('profile', u(2)),
  data('sampling_frequency_index', u(4)),
  data('private_bit', u(1)),
  data('channel_configuration', u(3)),
  data('original_copy', u(1)),
  data('home', u(1)),
  data('copyright_identification_bit', u(1)),
  data('copyright_identification_start', u(1)),
  data('aac_frame_length', u(13)),
  data('adts_buffer_fullness', u(11)),
  data('number_of_raw_data_blocks_in_frame', u(2)),
  when(equals('number_of_raw_data_blocks_in_frame', 0),
    adts_error_check,
    aacCodec),
  when(not(equals('number_of_raw_data_blocks_in_frame', 0)),
    adts_header_error_check,
    each((index, options, output) => {
      return index <= output.number_of_raw_data_blocks_in_frame;
    },
    newObj('frames[]', aacCodec),
    adts_error_check)));
