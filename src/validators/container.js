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

  const unknownPackets = esMap.filter((esEl) => esEl.type.startsWith('unknown-'));

  if (unknownPackets.length > 0) {
    warnings.push(`Detected ${unknownPackets.length} packets with unknown types`);
  }

  const pid0Packets = esMap.filter((esEl) => esEl.pid === 0);
  const invalidPid0Packets = pid0Packets.filter((esEl) => esEl.type !== 'pat');

  if (invalidPid0Packets.length > 0) {
    errors.push(
      `Detected ${invalidPid0Packets.length} packets with pid 0 and a non-PAT type`);
  }

  const patsWithExtraPrograms =
    esMap.filter((esEl) => esEl.type === 'pat' && esEl.table.length > 1);

  if (patsWithExtraPrograms.length > 0) {
    errors.push(
      `Detected ${patsWithExtraPrograms.length} PAT packets with more than one program`);
  }

  // we only parse the first PMT PID from the PAT, so we can also check for extra programs
  // by seeing if there are PMTs with different IDs
  const pmtPackets = esMap.filter((esEl) => esEl.type === 'pmt');
  const pmtPids = Array.from(new Set(pmtPackets.map((packet) => packet.pid)));

  if (pmtPids.length > 1) {
    errors.push(
      `Detected ${pmtPids.length} programs in the stream (more than allowed 1)`);
  }

  let tracks = [];

  // find tracks with unique IDs
  pmtPackets.forEach((pmtPacket) => {
    pmtPacket.tracks.forEach((track) => {
      if (!tracks.find((seenTrack) => seenTrack.id === track.id)) {
        tracks.push(track);
      }
    });
  });

  const audioTracks = tracks.filter((track) => track.type === 'audio');

  if (audioTracks.length > 1) {
    warnings.push(`Detected ${audioTracks.length} audio tracks (more than preferred 1)`);
  }

  if (audioTracks.length >= 1) {
    const audioCodecs =
      Array.from(new Set(audioTracks.map((audioTrack) => audioTrack.codec)));
    const unsupportedAudioCodecs =
      audioCodecs.filter((audioCodec) => audioCodec !== 'adts');

    if (unsupportedAudioCodecs.length > 0) {
      warnings.push(
        `Detected unsupported audio codec(s) ${unsupportedAudioCodecs.join(', ')} ` +
        `(we only support AAC, determined by presence of ADTS)`);
    }
  }

  const videoTracks = tracks.filter((track) => track.type === 'video');

  if (videoTracks.length === 0) {
    warnings.push('No video track detected');
  }

  if (videoTracks.length > 1) {
    warnings.push(`Detected ${videoTracks.length} video tracks (more than preferred 1)`);
  }

  if (videoTracks.length >= 1) {
    const videoCodecs =
      Array.from(new Set(videoTracks.map((videoTrack) => videoTrack.codec)));
    const unsupportedVideoCodecs =
      videoCodecs.filter((videoCodec) => videoCodec !== 'avc');

    if (unsupportedVideoCodecs.length > 0) {
      warnings.push(
        `Detected unsupported video codec(s) ${unsupportedVideoCodecs.join(', ')} ` +
        `(we only support AVC)`);
    }
  }

  const unsupportedTracks =
    tracks.filter((track) => !['video', 'audio', 'metadata'].includes(track.type));

  if (unsupportedTracks.length > 0) {
    warnings.push('Detected unsupported track types');
  }

  return {
    warnings,
    errors
  };
};
