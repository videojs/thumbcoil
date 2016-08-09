'use strict';

import {start, list, data, debug, verify} from './lib/combinators';
import {when, each, inArray, equals, some, every, not} from './lib/conditionals';
import {ue, u, se, val} from './lib/data-types';

import scalingList from './scaling-list';
import vuiParamters from './vui-parameters';

let v = null;

let PROFILES_WITH_OPTIONAL_SPS_DATA = [
  44, 83, 86, 100, 110, 118, 122, 128,
  134, 138, 139, 244
];

let getChromaFormatIdcValue = {
  read: (expGolomb, output, options, index) => {
    return output.chroma_format_idc || options.chroma_format_idc;
  },
  write:()=>{}
};

/**
  * NOW we are ready to build an SPS parser!
  */
const spsCodec = start('seq_parameter_set',
  list([
    // defaults
    data('chroma_format_idc', val(1)),
    data('video_format', val(5)),
    data('color_primaries', val(2)),
    data('transfer_characteristics', val(2)),
    data('sample_ratio', val(1.0)),

    data('profile_idc', u(8)),
    data('constraint_set0_flag', u(1)),
    data('constraint_set1_flag', u(1)),
    data('constraint_set2_flag', u(1)),
    data('constraint_set3_flag', u(1)),
    data('constraint_set4_flag', u(1)),
    data('constraint_set5_flag', u(1)),
    data('constraint_set6_flag', u(1)),
    data('constraint_set7_flag', u(1)),
    data('level_idc', u(8)),
    data('seq_parameter_set_id', ue(v)),
    when(inArray('profile_idc', PROFILES_WITH_OPTIONAL_SPS_DATA),
      list([
        data('chroma_format_idc', ue(v)),
        when(equals('chroma_format_idc', 3),
          data('separate_colour_plane_flag', u(1))),
        when(not(equals('chroma_format_idc', 3)),
          data('separate_colour_plane_flag', val(0))),
        data('bit_depth_luma_minus8', ue(v)),
        data('bit_depth_chroma_minus8', ue(v)),
        data('qpprime_y_zero_transform_bypass_flag', u(1)),
        data('seq_scaling_matrix_present_flag', u(1)),
        when(equals('seq_scaling_matrix_present_flag', 1),
          each((index, output) => {
              return index < ((output.chroma_format_idc !== 3) ? 8 : 12);
            },
            list([
              data('seq_scaling_list_present_flag[]', u(1)),
              when(equals('seq_scaling_list_present_flag[]', 1),
                scalingList)
            ])))
      ])),
    data('log2_max_frame_num_minus4', ue(v)),
    data('pic_order_cnt_type', ue(v)),
    when(equals('pic_order_cnt_type', 0),
      data('log2_max_pic_order_cnt_lsb_minus4', ue(v))),
    when(equals('pic_order_cnt_type', 1),
      list([
        data('delta_pic_order_always_zero_flag', u(1)),
        data('offset_for_non_ref_pic', se(v)),
        data('offset_for_top_to_bottom_field', se(v)),
        data('num_ref_frames_in_pic_order_cnt_cycle', ue(v)),
        each((index, output) => {
            return index < output.num_ref_frames_in_pic_order_cnt_cycle;
          },
          data('offset_for_ref_frame[]', se(v)))
      ])),
    data('max_num_ref_frames', ue(v)),
    data('gaps_in_frame_num_value_allowed_flag', u(1)),
    data('pic_width_in_mbs_minus1', ue(v)),
    data('pic_height_in_map_units_minus1', ue(v)),
    data('frame_mbs_only_flag', u(1)),
    when(equals('frame_mbs_only_flag', 0),
      data('mb_adaptive_frame_field_flag', u(1))),
    data('direct_8x8_inference_flag', u(1)),
    data('frame_cropping_flag', u(1)),
    when(equals('frame_cropping_flag', 1),
      list([
        data('frame_crop_left_offset', ue(v)),
        data('frame_crop_right_offset', ue(v)),
        data('frame_crop_top_offset', ue(v)),
        data('frame_crop_bottom_offset', ue(v))
      ])),
    data('vui_parameters_present_flag', u(1)),
    when(equals('vui_parameters_present_flag', 1), vuiParamters),
    // The following field is a derived value that is used for parsing
    // slice headers
    when(equals('separate_colour_plane_flag', 1),
      data('ChromaArrayType', val(0))),
    when(equals('separate_colour_plane_flag', 0),
      data('ChromaArrayType', getChromaFormatIdcValue)),
    verify('seq_parameter_set')
  ]));

export default spsCodec;
