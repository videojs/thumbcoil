import h264Codecs from './bit-streams/h264';

import {tsInspector, mp4Inspector} from './inspectors';

const thumbCoil = {
  h264Codecs,
  mp4Inspector,
  tsInspector
};

// Include the version number.
thumbCoil.VERSION = '__VERSION__';

export default thumbCoil;
