'use strict';

export const typedArrayToBitString = (data) => {
  var array = [];
  var bytesPerElement = data.BYTES_PER_ELEMENT || 1;
  var prefixZeros = '';

  for (let i = 0; i < data.length; i++) {
    array.push(data[i]);
  }

  for (let i = 0; i < bytesPerElement; i++) {
    prefixZeros += '00000000';
  }

  return array
    .map((n) => (prefixZeros + n.toString(2)).slice(-bytesPerElement * 8))
    .join('');
};

export const bitStringToTypedArray = (bitString) => {
  let bitsNeeded = 8 - (bitString.length % 8);

  // Pad with zeros to make length a multiple of 8
  for (let i = 0; bitsNeeded !==8 && i < bitsNeeded; i++) {
    bitString += '0';
  }

  let outputArray = bitString.match(/(.{8})/g);
  let numberArray = outputArray.map((n) => parseInt(n, 2));

  return new Uint8Array(numberArray);
};

export const removeRBSPTrailingBits = (bits) => {
  return bits.split(/10*$/)[0];
};

export const appendRBSPTrailingBits = (bits) => {
  let bitString = bits + '10000000';

  return bitString.slice(0, -(bitString.length % 8));
};
