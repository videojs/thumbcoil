import {ExpGolombDecoder, ExpGolombEncoder} from '../../lib/exp-golomb-string';
import {start, startArray, list, data, debug, verify, newObj} from '../../lib/combinators';
import {when, each, inArray, equals, some, every, not, whileMoreData, gt} from '../../lib/conditionals';
import {ue, u, se, val} from '../../lib/data-types';
import {
  typedArrayToBitString,
  bitStringToTypedArray,
  appendRBSPTrailingBits
} from '../../lib/rbsp-utils';
import {swb_offset_long_window, swb_offset_short_window} from './scale-factor-bands';
import {readCodebookValue, scaleFactorCB, spectrumCB} from './codebooks-final';

const EIGHT_SHORT_SEQUENCE =2;
const QUAD_LEN = 4;
const PAIR_LEN = 2;
const ZERO_HCB = 0;
const FIRST_PAIR_HCB = 5;
const ESC_HCB = 11;
const NOISE_HCB = 13;
const INTENSITY_HCB2 = 14;
const INTENSITY_HCB = 15;
const ESC_FLAG = 16;

const elemTypes = [
  'single_channel_element',
  'channel_pair_element',
  'coupling_channel_element',
  'lfe_channel_element',
  'data_stream_element',
  'program_config_element',
  'fill_element',
  'end'
];

const bit_set = function (val, bit) {
  return (1 << bit) & val;
}

const doPostIcsCalculation = {
  decode: (expGolomb, output, options, index) => {
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
  decode: (expGolomb, output, options, index) => {
    let bits = 5;
    if (output.window_sequence === EIGHT_SHORT_SEQUENCE) {
      bits = 3;
    }

    let sect_esc_val = (1 << bits) - 1;
    for (let g = 0; g < output.num_window_groups; g++) {
      let k = 0;
      let i = 0;

      output.sect_cb = [[]];
      output.sect_start = [[]];
      output.sect_end = [[]];
      output.num_sec = [];
      output.sfb_cb = [[]];

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
  decode: (expGolomb, output, options, index) => {
    for (let g = 0; g < output.num_window_groups; g++) {
      for (let sfb = 0; sfb < output.max_sfb; sfb++) {
        if (output.sfb_cb[g][sfb] !== ZERO_HCB) {
          readCodebookValue(scaleFactorCB, expGolomb);
        }
      }
    }
    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const tnsData = {
  decode: (expGolomb, output, options, index) => {
    output.n_filt = [];
    output.coef_res = [];
    output.length = [[]];
    output.order = [[]];
    output.direction = [[]];
    output.coef_compress = [[]];
    output.coef = [[]];

    for (let w = 0; w < output.num_windows; w++) {
      output.n_filt[w] = expGolomb.readBits(2);

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
            output.coef[w][filt][i] = expGolomb.readBits(4);
          }
        }
      }
    }

    return output;
  },
  encode: (expGolomb, input, options, index) => {
  }
};

const spectralData = {
  decode: (expGolomb, output, options, index) => {
    for (let g = 0; g < output.num_window_groups; g++) {
      for (let i = 0; i < output.num_sec[g]; i++) {
        let sect_cb = output.sect_cb[g][i];
        if (sect_cb !== ZERO_HCB && sect_cb !== ESC_HCB && sect_cb !== NOISE_HCB && sect_cb !== INTENSITY_HCB && sect_cb !== INTENSITY_HCB2) {
          for (let k = output.sect_sfb_offset[g][output.sect_start[g][i]];
               k < output.sect_sfb_offset[g][output.sect_end[g][i]];) {
            if (sect_cb < FIRST_PAIR_HCB) {
              readCodebookValue(spectrumCB[sect_cb], expGolomb);
              k += QUAD_LEN;
            } else if (sect_cb < ESC_HCB) {
              readCodebookValue(spectrumCB[sect_cb], expGolomb);
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

const ics = list([
  data('ics_reserved_bit', u(1)),
  data('window_sequence', u(2)),
  data('window_shape', u(1)),
  when(equals('window_sequence', EIGHT_SHORT_SEQUENCE), list([
      data('max_sfb', u(4)),
      data('scale_factor_grouping', u(7))
    ])),
  when(not(equals('window_sequence', EIGHT_SHORT_SEQUENCE)), list([
      data('max_sfb', u(6)),
      data('predictor_data_present', u(1)),
      when(equals('predictor_data_present', 1), list([
          data('predictor_reset', u(1)),
          when(equals('predictor_reset', 1), data('predictor_reset_group_number', u(5))),
          each((index, options) => {
            return index < Math.min(options.max_sfb, 40); // TODO: FIX HARDCODED FOR 48khz
          }, data('prediction_used[]', u(1)))
        ]))
    ])),
  doPostIcsCalculation
]);

const individualChannelStream = list([
  data('global_gain', u(8)),
  when(not(equals('common_window', 1)), ics),
  sectionData,
  scaleFactorData,
  data('pulse_data_present', u(1)),
  //when(equals('pulse_data_present', 1), pulseData),
  data('tns_data_present', u(1)),
  when(equals('tns_data_present', 1), tnsData),
  data('gain_control_data_present', u(1)),
  //when(equals('gain_control_data_present', 1), gainControlData),
  spectralData
]);

const noop = {decode:()=>{}};

const elemParsers = [
  noop,
  list([
    data('element_instance_tag', u(4)),
    data('common_window', u(1)),
    when(equals('common_window', 1), list([
        ics,
        data('ms_mask_present', u(2))
      ])),
    newObj('ics_1', list([
      data('type', val('individual_channel_stream')),
       individualChannelStream
      ])),
    newObj('ics_2', list([
      data('type', val('individual_channel_stream')),
       individualChannelStream
      ])),
  ]),
  noop,
  noop,
  noop,
  noop,
  noop,
  noop
];

export const aacCodec = start('elements', each((index)=>index <= 0, //whileMoreData(
  newObj('elements[]',
    list([
      data('id_syn_ele', u(3)),
      when(equals('id_syn_ele', 0), list([
        data('type', val(elemTypes[0])),
        elemParsers[0]
      ])),
      when(equals('id_syn_ele', 1), list([
        data('type', val(elemTypes[1])),
        elemParsers[1]
      ])),
      when(equals('id_syn_ele', 2), list([
        data('type', val(elemTypes[2])),
        elemParsers[2]
      ])),
      when(equals('id_syn_ele', 3), list([
        data('type', val(elemTypes[3])),
        elemParsers[3]
      ])),
      when(equals('id_syn_ele', 4), list([
        data('type', val(elemTypes[4])),
        elemParsers[4]
      ])),
      when(equals('id_syn_ele', 5), list([
        data('type', val(elemTypes[5])),
        elemParsers[5]
      ])),
      when(equals('id_syn_ele', 6), list([
        data('type', val(elemTypes[6])),
        elemParsers[6]
      ])),
      when(equals('id_syn_ele', 7), list([
        data('type', val(elemTypes[7])),
        elemParsers[7]
      ]))
    ])
)));
