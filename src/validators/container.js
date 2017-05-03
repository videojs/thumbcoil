const isIFrame = (frame) => {
  if (!frame.nals) {
    return false;
  }

  // nal_unit_type of 5 is a coded slice of an IDR (instantaneous decoding refresh)
  // picture
  if (frame.nals.find((nal) => nal.nal_unit_type === 5)) {
    return true;
  }

  // slice_layer_without_partitioning_rbsp_idr is an IDR variant of
  // slice_layer_without_partitioning_rbsp
  if (frame.nals.find(
        (nal) => nal.type === 'slice_layer_without_partitioning_rbsp_idr')) {
    return true;
  }

  const seiMessage = frame.nals.find((nal) => nal.type === 'sei_message');

  if (seiMessage &&
      seiMessage.recovery_point &&
      seiMessage.recovery_point.exact_match_flag === 1) {
    return true;
  }

  return false;
};

export const validateContainers = (esMap) => {
  let warnings = [];
  let errors = [];

  const iFrames = esMap.filter((esEl) => esEl.type === 'video').filter(isIFrame);

  if (iFrames.length === 0) {
    warnings.push('Video has no I frames');
  }

  const unknownFrames = esMap.filter((esEl) => esEl.type.startsWith('unknown-'));

  if (unknownFrames.length > 0) {
    // TODO determine if there are any unsupported codecs
    warnings.push(`Detected ${unknownFrames.length} frames with unknown types`);
  }

  const pid0Packets = esMap.filter((esEl) => esEl.pid === 0);
  const invalidPid0Packets = pid0Packets.filter((esEl) => esEl.type !== 'pat');

  if (invalidPid0Packets.length > 0) {
    errors.push(
      `Detected ${invalidPid0Packets.length} packets with pid 0 and a non-PAT type`);
  }

  // we only parse the first PMT PID from the PAT, but we can check for extra programs
  // by seeing if there are PMTs with different IDs

  const pmtPackets = esMap.filter((esEl) => esEl.type === 'pmt');
  const pmtPids = Array.from(new Set(pmtPackets.map((packet) => packet.pid)));

  if (pmtPids.length > 1) {
    errors.push(
      `Detected ${pmtPids.length} programs in the stream (more than allowed 1)`);
  }

  let tracks = [];

  pmtPackets.forEach((pmtPacket) => {
    tracks = tracks.concat(pmtPacket.tracks);
  });

  const audioTracks = tracks.filter((track) => track.type === 'audio');

  if (audioTracks.length > 1) {
    warnings.push(`Detected ${audioTracks.length} audio tracks (more than preferred 1)`);
  }

  // TODO
  // WARNINGS
  // unsupported codecs

  return {
    warnings,
    errors
  };
};
