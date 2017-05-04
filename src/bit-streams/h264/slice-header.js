'use strict';

import {start, data, debug, verify} from '../../lib/combinators';
import {list} from '../../lib/list';
import {when, each, inArray, equals, some, every, not} from '../../lib/conditionals';
import {ue, u, se, val} from '../../lib/data-types';

let v = null;

let sliceType = {
  P: [0, 5],
  B: [1, 6],
  I: [2, 7],
  SP: [3, 8],
  SI: [4, 9]
};

/**
 * Functions for calculating the number of bits to read for certain
 * properties based on the values in other properties (usually specified
 * in the SPS)
 */
let frameNumBits = (expGolomb, data, options, index) => {
  return options.log2_max_frame_num_minus4 + 4;
};

let picOrderCntBits = (expGolomb, data, options, index) => {
  return options.log2_max_pic_order_cnt_lsb_minus4 + 4;
};

let sliceGroupChangeCycleBits = (expGolomb, data, options, index) => {
  let picHeightInMapUnits = options.pic_height_in_map_units_minus1 + 1;
  let picWidthInMbs = options.pic_width_in_mbs_minus1 + 1;
  let sliceGroupChangeRate = options.slice_group_change_rate_minus1 + 1;
  let picSizeInMapUnits = picWidthInMbs * picHeightInMapUnits;

  return Math.ceil(Math.log(picSizeInMapUnits / sliceGroupChangeRate + 1) / Math.LN2);
};

let useWeightedPredictionTable = some([
  every([
    equals('weighted_pred_flag', 1),
    some([
      inArray('slice_type', sliceType.P),
      inArray('slice_type', sliceType.SP)
    ])
  ]),
  every([
    equals('weighted_bipred_idc', 1),
    inArray('slice_type', sliceType.B),
  ])
]);

let refPicListModification = list([
  when(every([
      not(inArray('slice_type', sliceType.I)),
      not(inArray('slice_type', sliceType.SI))
    ]),
    data('ref_pic_list_modification_flag_l0', u(1)),
    when(equals('ref_pic_list_modification_flag_l0', 1),
      each((index, output) => {
          return index === 0 || output.modification_of_pic_nums_idc_l0[index - 1] !== 3;
        },
        data('modification_of_pic_nums_idc_l0[]', ue(v)),
        when(inArray('modification_of_pic_nums_idc_l0[]', [0, 1]),
          data('abs_diff_pic_num_minus1_l0[]', ue(v))),
        when(equals('modification_of_pic_nums_idc_l0[]', 2),
          data('long_term_pic_num_l0[]', ue(v)))))),
  when(inArray('slice_type', sliceType.B),
    data('ref_pic_list_modification_flag_l1', u(1)),
    when(equals('ref_pic_list_modification_flag_l1', 1),
      each((index, output) => {
          return index === 0 || output.modification_of_pic_nums_idc_l1[index - 1] !== 3;
        },
        data('modification_of_pic_nums_idc_l1[]', ue(v)),
        when(inArray('modification_of_pic_nums_idc_l1[]', [0, 1]),
          data('abs_diff_pic_num_minus1_l1[]', ue(v))),
        when(equals('modification_of_pic_nums_idc_l1[]', 2),
          data('long_term_pic_num_l1[]', ue(v))))))
]);

let refPicListMvcModification = {
  encode: () => { throw new Error('ref_pic_list_mvc_modification: NOT IMPLEMENTED!')},
  decode: () => {throw new Error('ref_pic_list_mvc_modification: NOT IMPLEMENTED!')}
};

let predWeightTable = list([
  data('luma_log2_weight_denom', ue(v)),
  when(not(equals('ChromaArrayType', 0)),
    data('chroma_log2_weight_denom', ue(v))),
  each((index, output) => {
      return index <= output.num_ref_idx_l0_active_minus1;
    },
    data('luma_weight_l0_flag', u(1)),
    when(equals('luma_weight_l0_flag', 1),
      data('luma_weight_l0[]', se(v)),
      data('luma_offset_l0[]', se(v)),
      when(not(equals('ChromaArrayType', 0)),
        data('chroma_weight_l0_flag', u(1)),
        when(equals('chroma_weight_l0_flag', 1),
          data('chroma_weight_l0_Cr[]', se(v)),
          data('chroma_offset_l0_Cr[]', se(v)),
          data('chroma_weight_l0_Cb[]', se(v)),
          data('chroma_offset_l0_Cb[]', se(v)))))),
  when(inArray('slice_type', sliceType.B),
    each((index, output) => {
        return index <= output.num_ref_idx_l1_active_minus1;
      },
      data('luma_weight_l1_flag', u(1)),
      when(equals('luma_weight_l1_flag', 1),
        data('luma_weight_l1[]', se(v)),
        data('luma_offset_l1[]', se(v)),
        when(not(equals('ChromaArrayType', 0)),
          data('chroma_weight_l1_flag', u(1)),
          when(equals('chroma_weight_l1_flag', 1),
            data('chroma_weight_l1_Cr[]', se(v)),
            data('chroma_offset_l1_Cr[]', se(v)),
            data('chroma_weight_l1_Cb[]', se(v)),
            data('chroma_offset_l1_Cb[]', se(v)))))))
]);

let decRefPicMarking = list([
  when(equals('nal_unit_type', 5),
    data('no_output_of_prior_pics_flag', u(1)),
    data('long_term_reference_flag', u(1))),
  when(not(equals('nal_unit_type', 5)),
    data('adaptive_ref_pic_marking_mode_flag', u(1)),
    when(equals('adaptive_ref_pic_marking_mode_flag', 1),
      each((index, output) => {
          return index === 0 || output.memory_management_control_operation[index - 1] !== 0;
      },
      data('memory_management_control_operation[]', ue(v)),
      when(inArray('memory_management_control_operation[]', [1, 3]),
        data('difference_of_pic_nums_minus1[]', ue(v))),
      when(inArray('memory_management_control_operation[]', [2]),
        data('long_term_pic_num[]', ue(v))),
      when(inArray('memory_management_control_operation[]', [3, 6]),
        data('long_term_frame_idx[]', ue(v))),
      when(inArray('memory_management_control_operation[]', [4]),
        data('max_long_term_frame_idx_plus1[]', ue(v))))))
]);

const sliceHeader = list([
  data('first_mb_in_slice', ue(v)),
  data('slice_type', ue(v)),
  data('pic_parameter_set_id', ue(v)),
  when(equals('separate_colour_plane_flag', 1),
    data('colour_plane_id', u(2))),
  data('frame_num', u(frameNumBits)),
  when(equals('frame_mbs_only_flag', 0),
    data('field_pic_flag', u(1)),
    when(equals('field_pic_flag', 1),
      data('bottom_field_flag', u(1)))),
  when(equals('idrPicFlag', 1),
    data('idr_pic_id', ue(v))),
  when(equals('pic_order_cnt_type', 0),
    data('pic_order_cnt_lsb', u(picOrderCntBits)),
    when(every([
        equals('bottom_field_pic_order_in_frame_present_flag', 1),
        not(equals('field_pic_flag', 1))
      ]),
      data('delta_pic_order_cnt_bottom', se(v)))),
  when(every([
      equals('pic_order_cnt_type', 1),
      not(equals('delta_pic_order_always_zero_flag', 1))
    ]),
    data('delta_pic_order_cnt[0]', se(v)),
    when(every([
        equals('bottom_field_pic_order_in_frame_present_flag', 1),
        not(equals('field_pic_flag', 1))
      ]),
      data('delta_pic_order_cnt[1]', se(v)))),
  when(equals('redundant_pic_cnt_present_flag', 1),
    data('redundant_pic_cnt', ue(v))),
  when(inArray('slice_type', sliceType.B),
    data('direct_spatial_mv_pred_flag', u(1))),
  when(some([
      inArray('slice_type', sliceType.P),
      inArray('slice_type', sliceType.SP),
      inArray('slice_type', sliceType.B)
    ]),
    data('num_ref_idx_active_override_flag', u(1)),
    when(equals('num_ref_idx_active_override_flag', 1),
      data('num_ref_idx_l0_active_minus1', ue(v)),
      when(inArray('slice_type', sliceType.B),
        data('num_ref_idx_l1_active_minus1', ue(v))))),
  when(some([
      equals('nal_unit_type', 20),
      equals('nal_unit_type', 21)
    ]),
    refPicListMvcModification),
  when(every([
      not(equals('nal_unit_type', 20)),
      not(equals('nal_unit_type', 21))
    ]),
    refPicListModification),
  when(useWeightedPredictionTable, predWeightTable),
  when(not(equals('nal_ref_idc', 0)), decRefPicMarking),
  when(every([
      equals('entropy_coding_mode_flag', 1),
      not(inArray('slice_type', sliceType.I)),
      not(inArray('slice_type', sliceType.SI))
    ]),
    data('cabac_init_idc', ue(v))),
  data('slice_qp_delta', se(v)),
  when(inArray('slice_type', sliceType.SP),
    data('sp_for_switch_flag', u(1))),
  when(some([
      inArray('slice_type', sliceType.SP),
      inArray('slice_type', sliceType.SI),
    ]),
    data('slice_qs_delta', se(v))),
  when(equals('deblocking_filter_control_present_flag', 1),
    data('disable_deblocking_filter_idc', ue(v)),
    when(not(equals('disable_deblocking_filter_idc', 1)),
      data('slice_alpha_c0_offset_div2', se(v)),
      data('slice_beta_offset_div2', se(v)))),
  when(every([
      not(equals('num_slice_groups_minus1', 0)),
      some([
        equals('slice_group_map_type', 3),
        equals('slice_group_map_type', 4),
        equals('slice_group_map_type', 5),
      ])
    ]),
    data('slice_group_change_cycle', u(sliceGroupChangeCycleBits)))
]);

export default sliceHeader;
