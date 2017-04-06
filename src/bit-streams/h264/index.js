import accessUnitDelimiter from './access-unit-delimiter';
import seqParameterSet from './seq-parameter-set';
import picParameterSet from './pic-parameter-set';
import sliceLayerWithoutPartitioning from './slice-layer-without-partitioning';
import discardEmulationPrevention from './lib/discard-emulation-prevention';
import supplementalEnhancementInformation from './supplemental-enhancement-information';

const h264Codecs = {
  accessUnitDelimiter,
  seqParameterSet,
  picParameterSet,
  sliceLayerWithoutPartitioning,
  discardEmulationPrevention,
  supplementalEnhancementInformation
};

export default h264Codecs;
