'use strict';

import {start, list, data, debug, verify} from './lib/combinators';
import {
  when,
  each,
  inArray,
  equals,
  some,
  every,
  not,
  whenMoreData
} from './lib/conditionals';
import {ue, u, se, val} from './lib/data-types';

import scalingList from './scaling-list';

let v = null;

const ppsCodec = start('pic_parameter_set',
  list([
    data('pic_parameter_set_id',  ue(v)),
    data('seq_parameter_set_id',  ue(v)),
//    pickOptions('sps', 'seq_parameter_set_id'),
    data('entropy_coding_mode_flag',  u(1)),
    data('bottom_field_pic_order_in_frame_present_flag',  u(1)),
    data('num_slice_groups_minus1',  ue(v)),
    when(not(equals('num_slice_groups_minus1', 0)),
      list([
        data('slice_group_map_type',  ue(v)),
        when(equals('slice_group_map_type', 0),
          each((index, output) => {
              return index <= output.num_slice_groups_minus1;
            },
            data('run_length_minus1[]',  ue(v)))),
        when(equals('slice_group_map_type', 2),
          each((index, output) => {
              return index <= output.num_slice_groups_minus1;
            },
            list([
              data('top_left[]',  ue(v)),
              data('bottom_right[]',  ue(v)),
            ]))),
        when(inArray('slice_group_map_type', [3, 4, 5]),
          list([
            data('slice_group_change_direction_flag',  u(1)),
            data('slice_group_change_rate_minus1',  ue(v))
          ])),
        when(equals('slice_group_map_type', 6),
          list([
            data('pic_size_in_map_units_minus1',  ue(v)),
            each((index, output) => {
                return index <= output.pic_size_in_map_units_minus1;
              },
              data('slice_group_id[]',  ue(v)))
          ]))
      ])),
    data('num_ref_idx_l0_default_active_minus1',  ue(v)),
    data('num_ref_idx_l1_default_active_minus1',  ue(v)),
    data('weighted_pred_flag',  u(1)),
    data('weighted_bipred_idc',  u(2)),
    data('pic_init_qp_minus26',  se(v)),
    data('pic_init_qs_minus26',  se(v)),
    data('chroma_qp_index_offset',  se(v)),
    data('deblocking_filter_control_present_flag',  u(1)),
    data('constrained_intra_pred_flag',  u(1)),
    data('redundant_pic_cnt_present_flag',  u(1)),
    whenMoreData(list([
      data('transform_8x8_mode_flag',  u(1)),
      data('pic_scaling_matrix_present_flag',  u(1)),
      when(equals('pic_scaling_matrix_present_flag', 1),
        each((index, output) => {
            return index < 6 + ((output.chroma_format_Idc !== 3) ? 2 : 6) * output.transform_8x8_mode_flag;
          },
          list([
            data('pic_scaling_list_present_flag[]',  u(1)),
            when(equals('pic_scaling_list_present_flag[]', 1),
              scalingList)
          ]))),
      data('second_chroma_qp_index_offset',  se(v))
    ])),
    verify('pic_parameter_set')
  ]));

export default ppsCodec;
