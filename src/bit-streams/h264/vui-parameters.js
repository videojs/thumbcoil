'use strict';

import {start, list, data} from '../../lib/combinators';
import {when, equals, some} from '../../lib/conditionals';
import {ue, u, val} from '../../lib/data-types';

import hdrParameters from './hdr-parameters';

let v = null;

let sampleRatioCalc = list([
  /*
    1:1
   7680x4320 16:9 frame without horizontal overscan
   3840x2160 16:9 frame without horizontal overscan
   1280x720 16:9 frame without horizontal overscan
   1920x1080 16:9 frame without horizontal overscan (cropped from 1920x1088)
   640x480 4:3 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 1),
    data('sample_ratio', val(1))),
  /*
    12:11
   720x576 4:3 frame with horizontal overscan
   352x288 4:3 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 2),
    data('sample_ratio', val(12 / 11))),
  /*
    10:11
   720x480 4:3 frame with horizontal overscan
   352x240 4:3 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 3),
    data('sample_ratio', val(10 / 11))),
  /*
    16:11
   720x576 16:9 frame with horizontal overscan
   528x576 4:3 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 4),
    data('sample_ratio', val(16 / 11))),
  /*
    40:33
   720x480 16:9 frame with horizontal overscan
   528x480 4:3 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 5),
    data('sample_ratio', val(40 / 33))),
  /*
    24:11
   352x576 4:3 frame without horizontal overscan
   480x576 16:9 frame with horizontal overscan
   */
  when(equals('aspect_ratio_idc', 6),
    data('sample_ratio', val(24 / 11))),
  /*
    20:11
   352x480 4:3 frame without horizontal overscan
   480x480 16:9 frame with horizontal overscan
   */
  when(equals('aspect_ratio_idc', 7),
    data('sample_ratio', val(20 / 11))),
  /*
    32:11
   352x576 16:9 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 8),
    data('sample_ratio', val(32 / 11))),
  /*
    80:33
   352x480 16:9 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 9),
    data('sample_ratio', val(80 / 33))),
  /*
    18:11
   480x576 4:3 frame with horizontal overscan
   */
  when(equals('aspect_ratio_idc', 10),
    data('sample_ratio', val(18 / 11))),
  /*
    15:11
   480x480 4:3 frame with horizontal overscan
   */
  when(equals('aspect_ratio_idc', 11),
    data('sample_ratio', val(15 / 11))),
  /*
    64:33
   528x576 16:9 frame with horizontal overscan
   */
  when(equals('aspect_ratio_idc', 12),
    data('sample_ratio', val(64 / 33))),
  /*
    160:99
   528x480 16:9 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 13),
    data('sample_ratio', val(160 / 99))),
  /*
    4:3
   1440x1080 16:9 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 14),
    data('sample_ratio', val(4 / 3))),
  /*
    3:2
   1280x1080 16:9 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 15),
    data('sample_ratio', val(3 / 2))),
  /*
    2:1
   960x1080 16:9 frame without horizontal overscan
   */
  when(equals('aspect_ratio_idc', 16),
    data('sample_ratio', val(2 / 1))),
  /* Extended_SAR */
  when(equals('aspect_ratio_idc', 255),
    list([
      data('sar_width', u(16)),
      data('sar_height', u(16)),
      data('sample_ratio',
        val((expGolomb, output, options) => output.sar_width / output.sar_height))
    ]))
]);

const vuiParamters = list([
  data('aspect_ratio_info_present_flag', u(1)),
  when(equals('aspect_ratio_info_present_flag', 1),
    list([
      data('aspect_ratio_idc', u(8)),
      sampleRatioCalc,
    ])),
  data('overscan_info_present_flag', u(1)),
  when(equals('overscan_info_present_flag', 1),
    data('overscan_appropriate_flag', u(1))),
  data('video_signal_type_present_flag', u(1)),
  when(equals('video_signal_type_present_flag', 1),
    list([
      data('video_format', u(3)),
      data('video_full_range_flag', u(1)),
      data('colour_description_present_flag', u(1)),
      when(equals('colour_description_present_flag', 1),
        list([
          data('colour_primaries', u(8)),
          data('transfer_characteristics', u(8)),
          data('matrix_coefficients', u(8))
        ]))
    ])),
  data('chroma_loc_info_present_flag', u(1)),
  when(equals('chroma_loc_info_present_flag', 1),
    list([
      data('chroma_sample_loc_type_top_field', ue(v)),
      data('chroma_sample_loc_type_bottom_field', ue(v))
    ])),
  data('timing_info_present_flag', u(1)),
  when(equals('timing_info_present_flag', 1),
    list([
      data('num_units_in_tick', u(32)),
      data('time_scale', u(32)),
      data('fixed_frame_rate_flag', u(1))
    ])),
  data('nal_hrd_parameters_present_flag', u(1)),
  when(equals('nal_hrd_parameters_present_flag', 1), hdrParameters),
  data('vcl_hrd_parameters_present_flag', u(1)),
  when(equals('vcl_hrd_parameters_present_flag', 1), hdrParameters),
  when(
    some([
      equals('nal_hrd_parameters_present_flag', 1),
      equals('vcl_hrd_parameters_present_flag', 1)
    ]),
    data('low_delay_hrd_flag', u(1))),
  data('pic_struct_present_flag', u(1)),
  data('bitstream_restriction_flag', u(1)),
  when(equals('bitstream_restriction_flag', 1),
    list([
      data('motion_vectors_over_pic_boundaries_flag', u(1)),
      data('max_bytes_per_pic_denom', ue(v)),
      data('max_bits_per_mb_denom', ue(v)),
      data('log2_max_mv_length_horizontal', ue(v)),
      data('log2_max_mv_length_vertical', ue(v)),
      data('max_num_reorder_frames', ue(v)),
      data('max_dec_frame_buffering', ue(v))
    ]))
]);

export default vuiParamters;
