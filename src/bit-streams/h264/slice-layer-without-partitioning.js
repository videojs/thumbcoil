'use strict';

import sliceHeader from './slice-header';
import {start, list} from '../../lib/combinators';

const sliceLayerWithoutPartitioningCodec = start('slice_layer_without_partitioning',
   sliceHeader);
  // TODO: slice_data

export default sliceLayerWithoutPartitioningCodec;
