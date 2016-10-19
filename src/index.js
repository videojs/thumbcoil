import h264Codecs from './bit-streams/h264';

import {tsInspector, mp4Inspector, flvInspector} from './inspectors';

const thumbCoil = {
  h264Codecs,
  mp4Inspector,
  tsInspector,
  flvInspector
};

// Include the version number.
thumbCoil.VERSION = '__VERSION__';

export default thumbCoil;
