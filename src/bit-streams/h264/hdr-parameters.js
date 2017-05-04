'use strict';

import {data} from '../../lib/combinators';
import {list} from '../../lib/list';
import {u, ue} from '../../lib/data-types';
import {each} from '../../lib/conditionals';

import scalingList from './scaling-list';

let v = null;

const hdrParameters = list([
  data('cpb_cnt_minus1', ue(v)),
  data('bit_rate_scale', u(4)),
  data('cpb_size_scale', u(4)),
  each((index, output) => {
    return index <= output.cpb_cnt_minus1;
  },
  list([
    data('bit_rate_value_minus1[]', ue(v)),
    data('cpb_size_value_minus1[]', ue(v)),
    data('cbr_flag[]', u(1))
  ])),
  data('initial_cpb_removal_delay_length_minus1', u(5)),
  data('cpb_removal_delay_length_minus1', u(5)),
  data('dpb_output_delay_length_minus1', u(5)),
  data('time_offset_length', u(5))
]);

export default hdrParameters;
