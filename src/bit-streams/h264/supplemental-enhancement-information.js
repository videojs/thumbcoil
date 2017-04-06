'use strict';

import {ExpGolombDecoder, ExpGolombEncoder} from './lib/exp-golomb-string';
import {start, startArray, list, data, debug, verify, newObj} from './lib/combinators';
import {when, each, inArray, equals, some, every, not, whileMoreData, gt} from './lib/conditionals';
import {ue, u, se, val} from './lib/data-types';
import {
  typedArrayToBitString,
  bitStringToTypedArray,
  appendRBSPTrailingBits
} from './lib/rbsp-utils';

let v = null;

const noopCodec = list([]);

const initialCpbRemovalDelayLength = (expGolomb, data, options, index) => {
  return options.initial_cpb_removal_delay_length_minus1 + 1;
};

const cpbRemovalDelayBits = (expGolomb, data, options, index) => {
  return options.cpb_removal_delay_length_minus1 + 1;
};

const dpbOutputDelayBits = (expGolomb, data, options, index) => {
  return options.dpb_output_delay_length_minus1 + 1;
};

const timeOffsetBits = (expGolomb, data, options, index) => {
  return options.time_offset_length;
};

const seiPayloadCodecs = {
  '0': {
    name: 'buffering_period',
    codec: list([
      data('seq_parameter_set_id', ue(v)),
      when(equals('nal_hrd_parameters_present_flag', 1),
        each((index, output, options) => {
          return index <= options.cpb_cnt_minus1;
        },
        list([
          data('initial_cpb_removal_delay[]', u(initialCpbRemovalDelayLength)),
          data('initial_cpb_removal_delay_offset[]', u(initialCpbRemovalDelayLength))
        ]))),
      when(equals('vcl_hrd_parameters_present_flag', 1),
        each((index, output, options) => {
          return index <= options.cpb_cnt_minus1;
        },
        list([
          data('initial_cpb_removal_delay[]', u(initialCpbRemovalDelayLength)),
          data('initial_cpb_removal_delay_offset[]', u(initialCpbRemovalDelayLength))
        ])))
    ])
  },
  '1': {
    name: 'pic_timing',
    codec: list([
      when(
        some([
          equals('nal_hrd_parameters_present_flag', 1),
          equals('vcl_hrd_parameters_present_flag', 1)
        ]),
        list([
          data('cpb_removal_delay', u(cpbRemovalDelayBits)),
          data('dpb_output_delay', u(dpbOutputDelayBits))
        ])),
      when(equals('pic_struct_present_flag', 1),
        list([
          data('pic_struct', u(4)),

          // Interpret pic_struct
          when(equals('pic_struct', 0),
            data('NumClockTS', val(1))),
          when(equals('pic_struct', 1),
            data('NumClockTS', val(1))),
          when(equals('pic_struct', 2),
            data('NumClockTS', val(1))),
          when(equals('pic_struct', 3),
            data('NumClockTS', val(2))),
          when(equals('pic_struct', 4),
            data('NumClockTS', val(2))),
          when(equals('pic_struct', 5),
            data('NumClockTS', val(3))),
          when(equals('pic_struct', 6),
            data('NumClockTS', val(3))),
          when(equals('pic_struct', 7),
            data('NumClockTS', val(2))),
          when(equals('pic_struct', 8),
            data('NumClockTS', val(2))),

          each((index, output) => {
            return index < output.NumClockTS;
          }, list([
            data('clock_timestamp_flag[]', u(1)),
            when(equals('clock_timestamp_flag[]', 1),
              list([
                data('ct_type[]', u(2)),
                data('nuit_field_based_flag[]', u(1)),
                data('counting_type[]', u(5)),
                data('full_timestamp_flag[]', u(1)),
                data('discontinuity_flag[]', u(1)),
                data('cnt_dropped_flag[]', u(1)),
                data('n_frames[]', u(8)),
                when(equals('full_timestamp_flag[]', 1),
                  list([
                    data('seconds_value[]', u(6)),
                    data('minutes_value[]', u(6)),
                    data('hours_value[]', u(5))
                  ])),
                when(equals('full_timestamp_flag[]', 0),
                  list([
                    data('seconds_flag[]', u(1)),
                    when(equals('seconds_flag[]', 1),
                      list([
                        data('seconds_value[]', u(6)),
                        data('minutes_flag[]', u(1)),
                        when(equals('minutes_flag[]', 1),
                          list([
                            data('minutes_value[]', u(6)),
                            data('hours_flag[]', u(1)),
                            when(equals('hours_flag[]', 1),
                              data('hours_value[]', u(5)))
                          ]))
                      ]))
                  ])),
                  when(gt('time_offset_length', 0),
                    data('time_offset', u(timeOffsetBits)))
              ]))
          ]))
        ]))
      ])
  },
  '2': {
    name: 'pan_scan_rect'
  },
  '3': {
    name: 'filler_payload'
  },
  '4': {
    name: 'user_data_registered_itu_t_t35',
    codec: list([
      data('itu_t_t35_country_code', u(8)),
      data('itu_t_t35_provider_code', u(16)),
      when(equals('itu_t_t35_provider_code', 49),
        data('ATSC_user_identifier', u(32))),
      when(inArray('itu_t_t35_provider_code', [47, 49]),
        data('ATSC1_data_user_data_type_code', u(8))),
      when(equals('itu_t_t35_provider_code', 47),
        data('DIRECTV_user_data_length', u(8))),
      data('process_em_data_flag', u(1)),
      data('process_cc_data_flag', u(1)),
      data('additional_data_flag', u(1)),
      data('cc_count', u(5)),
      data('em_data', u(8)),
      each((index, output) => {
        return index < output.cc_count;
      },
      newObj('cc_data_pkts[]',
        list([
          data('type', val('cc_data_pkt')),
          data('marker_bits', u(5)),
          data('cc_valid', u(1)),
          data('cc_type', u(2)),
          data('cc_data_1', u(8)),
          data('cc_data_2', u(8)),
        ]))),
      data('marker_bits', u(8))
    ])
  },
  '5': {
    name: 'user_data_unregistered'
  },
  '6': {
    name: 'recovery_point',
    codec: list([
      data('recovery_frame_cnt', ue(v)),
      data('exact_match_flag', u(1)),
      data('broken_link_flag', u(1)),
      data('changing_slice_group_idc', u(2))
    ])
  },
  '7': {
    name: 'dec_ref_pic_marking_repetition'
  },
  '8': {
    name: 'spare_pic'
  },
  '9': {
    name: 'scene_info'
  },
  '10': {
    name: 'sub_seq_info'
  },
  '11': {
    name: 'sub_seq_layer_characteristics'
  },
  '12': {
    name: 'sub_seq_characteristics'
  },
  '13': {
    name: 'full_frame_freeze'
  },
  '14': {
    name: 'full_frame_freeze_release'
  },
  '15': {
    name: 'full_frame_snapshot'
  },
  '16': {
    name: 'progressive_refinement_segment_start'
  },
  '17': {
    name: 'progressive_refinement_segment_end'
  },
  '18': {
    name: 'motion_constrained_slice_group_set'
  },
  '19': {
    name: 'film_grain_characteristics'
  },
  '20': {
    name: 'deblocking_filter_display_preference'
  },
  '21': {
    name: 'stereo_video_info'
  },
  '22': {
    name: 'post_filter_hint'
  },
  '23': {
    name: 'tone_mapping_info'
  },
  '24': {
    name: 'scalability_info'
  },
  '25': {
    name: 'sub_pic_scalable_layer'
  },
  '26': {
    name: 'non_required_layer_rep'
  },
  '27': {
    name: 'priority_layer_info'
  },
  '28': {
    name: 'layers_not_present'
  },
  '29': {
    name: 'layer_dependency_change'
  },
  '30': {
    name: 'scalable_nesting'
  },
  '31': {
    name: 'base_layer_temporal_hrd'
  },
  '32': {
    name: 'quality_layer_integrity_check'
  },
  '33': {
    name: 'redundant_pic_property'
  },
  '34': {
    name: 'tl'
  },
  '35': {
    name: 'tl_switching_point'
  },
  '36': {
    name: 'parallel_decoding_info'
  },
  '37': {
    name: 'mvc_scalable_nesting'
  },
  '38': {
    name: 'view_scalability_info'
  },
  '39': {
    name: 'multiview_scene_info'
  },
  '40': {
    name: 'multiview_acquisition_info'
  },
  '41': {
    name: 'non_required_view_component'
  },
  '42': {
    name: 'view_dependency_change'
  },
  '43': {
    name: 'operation_points_not_present'
  },
  '44': {
    name: 'base_view_temporal_hrd'
  },
  '45': {
    name: 'frame_packing_arrangement'
  }
};

const seiPayloadParser = {
  decode: function (expGolomb, output, options, index) {
    let message = {
      payloadType: 0,
      payloadSize: 0,
    };

    let payloadByte;

    do {
      payloadByte = expGolomb.readUnsignedByte();
      message.payloadType += payloadByte;
    } while(payloadByte === 255);

    do {
      payloadByte = expGolomb.readUnsignedByte();
      message.payloadSize += payloadByte;
    } while(payloadByte === 255);

    let payloadCodec = seiPayloadCodecs[message.payloadType];
    let bitString = expGolomb.readRawBits(message.payloadSize * 8);

    if (payloadCodec) {
      message.type = payloadCodec.name;

      if (payloadCodec.codec) {
        let subExpGolomb = new ExpGolombDecoder(bitString);
        payloadCodec.codec.decode(subExpGolomb, message, options);
      } else {
        message.data = bitStringToTypedArray(bitString);
      }
    } else {
      message.type = 'unknown type';
      message.data = bitStringToTypedArray(bitString);
    }

    output[index] = message;

    return output;
  },
  encode: function (expGolomb, input, options, index) {
    // This function was never tested...
    let message = input[index];
    let payloadTypeRemaining = message.payloadType;

    while(payloadTypeRemaining > 255) {
      payloadTypeRemaining -= 255;
      expGolomb.writeUnsignedByte(255);
    }
    expGolomb.writeUnsignedByte(payloadTypeRemaining);

    let payloadSizeRemaining = message.payloadSize;

    while(payloadSizeRemaining > 255) {
      payloadSizeRemaining -= 255;
      expGolomb.writeUnsignedByte(255);
    }
    expGolomb.writeUnsignedByte(payloadSizeRemaining);

    let payloadCodec = seiPayloadCodecs[message.payloadType];

    if (payloadCodec && payloadCodec.codec) {
      let subExpGolomb = new ExpGolombEncoder();
      payloadCodec.codec.encode(subExpGolomb, message, options);
      let bits = subExpGolomb.bitReservoir;

      if (bits.length % 8 !== 0) {
        bits = appendRBSPTrailingBits(bits);
      }

      expGolomb.writeRawBits(message.payloadSize * 8, bits);
    } else if (message.data) {
      expGolomb.writeRawBits(message.payloadSize * 8, typedArrayToBitString(message.data));
    } else {
      // worse case scenario, just write 0s
      expGolomb.writeRawBits(message.payloadSize * 8, '');
    }
  }
};

/**
  * NOW we are ready to build an sei-message parser!
  */

const seiCodec = startArray('sei_message',
  whileMoreData(seiPayloadParser));

export default seiCodec;
