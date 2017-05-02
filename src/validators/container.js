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

  return {
    warnings,
    errors
  };
};
