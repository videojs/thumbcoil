 import {
   aacCodec, adtsCodec
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

    let id = (buffer[offset + 1] & 0x08) >> 3;
    let layer = (buffer[offset + 1] & 0x06) >> 1;
    // The protection skip bit tells us if we have 2 bytes of CRC data at the
    // end of the ADTS header
    let protectionAbsent = buffer[offset + 1] & 0x01;
    let profile = ((buffer[offset + 2] >>> 6) & 0x03) + 1;
    let samplingFrequencyIndex = (buffer[offset + 2] & 0x3c) >>> 2;
    let channelConfiguration =  ((buffer[offset + 2] & 1) << 2) |
        ((buffer[offset + 3] & 0xc0) >>> 6);
    // Frame length is a 13 bit integer starting 16 bits from the
    // end of the sync sequence
    let aacFrameLength = ((buffer[offset + 3] & 0x03) << 11) |
      (buffer[offset + 4] << 3) |
      ((buffer[offset + 5] & 0xe0) >> 5);
    let adtsBufferFullness = ((buffer[offset + 5] & 31) << 5) | ((buffer[offset + 6] & (63 << 2)) >> 2);
    let numberOfRawDataBlocksInFrame = buffer[offset + 6] & 0x3;

    // Derived values
    let samplingRate = ADTS_SAMPLING_FREQUENCIES[samplingFrequencyIndex];
    let protectionSkipBytes = protectionAbsent ? 0 : 2;
    let sampleCount = ((buffer[offset + 6] & 0x03) + 1) * 1024;
    let adtsFrameDuration = (sampleCount * 90000) / samplingRate;
    let frameEnd = offset + aacFrameLength;

    let data = buffer.subarray(offset + 7 + protectionSkipBytes, frameEnd);
    // Otherwise, deliver the complete AAC frame
    let adtsFrame = {
      type: 'frame',
      pts: packet.pts + (frameNum * adtsFrameDuration),
      dts: packet.dts + (frameNum * adtsFrameDuration),
      ID: id,
      layer: layer,
      sample_count: sampleCount,
      protection_absent: protectionAbsent,
      profile: profile,
      channel_configuration: channelConfiguration,
      sampling_rate: samplingRate,
      sampling_frequency_index: samplingFrequencyIndex,
      aac_frame_length: aacFrameLength,
      adts_buffer_fullness: adtsBufferFullness,
      number_of_raw_data_blocks_in_frame: numberOfRawDataBlocksInFrame,
      data: data
    };
    let options = {
      no_trailer_bits: true,
      sampling_frequency_index: adtsFrame.sampling_frequency_index
    };

    adtsFrame.elements = aacCodec.decode(adtsFrame.data, options);
    result.push(adtsFrame);

    offset = frameEnd;
    frameNum++;
  }

  return result;
};
