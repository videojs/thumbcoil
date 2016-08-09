'use strict';

import {start, data, list, verify} from './lib/combinators';
import {u} from './lib/data-types';

const audCodec = start('access_unit_delimiter',
  list([
    data('primary_pic_type', u(3)),
    verify('access_unit_delimiter')
  ]));

export default audCodec;
