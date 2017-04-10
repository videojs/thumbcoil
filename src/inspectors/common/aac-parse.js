 import {
   aacCodec
 } from '../../bit-streams/aac/raw_bit_stream';

const ADTS_SAMPLING_FREQUENCIES = [
  96000,
  88200,
  64000,
  48000,
  44100,
  32000,
  24000,
  22050,
  16000,
  12000,
  11025,
  8000,
  7350
];

export const parseAac = function (buffer) {
  return aacBitStream.decode(buffer, {}, []);
};

export const parseAdts = function (packet) {
  let result = [];
  let offset = 0;
  let frameNum = 0;
  let buffer = packet.data;

  while (offset < buffer.length) {
    // Loook for the start of an ADTS header
    if (buffer[offset] !== 0xFF || (buffer[offset + 1] & 0xF6) !== 0xF0) {
      // If a valid header was not found,  jump one forward and attempt to
      // find a valid ADTS header starting at the next byte
      offset++;
      continue;
    }

    // The protection skip bit tells us if we have 2 bytes of CRC data at the
    // end of the ADTS header
    let protectionSkipBytes = (~buffer[offset + 1] & 0x01) * 2;

    // Frame length is a 13 bit integer starting 16 bits from the
    // end of the sync sequence
    let frameLength = ((buffer[offset + 3] & 0x03) << 11) |
      (buffer[offset + 4] << 3) |
      ((buffer[offset + 5] & 0xe0) >> 5);

    let sampleCount = ((buffer[offset + 6] & 0x03) + 1) * 1024;
    let adtsFrameDuration = (sampleCount * 90000) /
      ADTS_SAMPLING_FREQUENCIES[(buffer[offset + 2] & 0x3c) >>> 2];

    let frameEnd = offset + frameLength;
    let data = buffer.subarray(offset + 7 + protectionSkipBytes, frameEnd);
    // Otherwise, deliver the complete AAC frame
    let adtsFrame = {
      type: 'adts',
      pts: packet.pts + (frameNum * adtsFrameDuration),
      dts: packet.dts + (frameNum * adtsFrameDuration),
      sampleCount: sampleCount,
      audioObjectType: ((buffer[offset + 2] >>> 6) & 0x03) + 1,
      channelCount: ((buffer[offset + 2] & 1) << 2) |
        ((buffer[offset + 3] & 0xc0) >>> 6),
      sampleRate: ADTS_SAMPLING_FREQUENCIES[(buffer[offset + 2] & 0x3c) >>> 2],
      sampling_frequency_index: (buffer[offset + 2] & 0x3c) >>> 2,
      data: data
    };
    adtsFrame.elements = aacCodec.decode(adtsFrame.data, adtsFrame);
    result.push(adtsFrame);

    offset = frameEnd + 1;
    frameNum++;
  }

  return result;
};
