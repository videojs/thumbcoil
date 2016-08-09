'use strict';

import {ExpGolombEncoder, ExpGolombDecoder} from './exp-golomb-string';
import {
  typedArrayToBitString,
  bitStringToTypedArray,
  removeRBSPTrailingBits,
  appendRBSPTrailingBits
} from './rbsp-utils';

/**
 * General ExpGolomb-Encoded-Structure Parse Functions
 */
export const start = function (name, parseFn) {
  return {
    decode: (input, options) => {
      let rawBitString = typedArrayToBitString(input);
      let bitString = removeRBSPTrailingBits(rawBitString);
      let expGolombDecoder = new ExpGolombDecoder(bitString);
      let output = {};

      options = options || {};

      return parseFn.decode(expGolombDecoder, output, options);
    },
    encode: (input, options) => {
      let expGolombEncoder = new ExpGolombEncoder();

      options = options || {};

      parseFn.encode(expGolombEncoder, input, options);

      let output = expGolombEncoder.bitReservoir;
      let bitString = appendRBSPTrailingBits(output);
      let data = bitStringToTypedArray(bitString);

      return data;
    }
  };
};

export const list = function (parseFns) {
  return {
    decode: (expGolomb, output, options, index) => {
      parseFns.forEach((fn) => {
        output = fn.decode(expGolomb, output, options, index) || output;
      });

      return output;
    },
    encode: (expGolomb, input, options, index) => {
      parseFns.forEach((fn) => {
        fn.encode(expGolomb, input, options, index);
      });
    }
  };
};

export const data = function (name, dataType) {
  let nameSplit = name.split(/\[(\d*)\]/);
  let property = nameSplit[0];
  let indexOverride;
  let nameArray;

  // The `nameSplit` array can either be 1 or 3 long
  if (nameSplit && nameSplit[0] !== '') {
    if (nameSplit.length > 1) {
      nameArray = true;
      indexOverride = parseFloat(nameSplit[1]);

      if (isNaN(indexOverride)) {
        indexOverride = undefined;
      }
    }
  } else {
    throw new Error('ExpGolombError: Invalid name "' + name + '".');
  }

  return {
    name: name,
    decode: (expGolomb, output, options, index) => {
      let value;

      if (typeof indexOverride === 'number') {
        index = indexOverride;
      }

      value = dataType.read(expGolomb, output, options, index);

      if (!nameArray) {
        output[property] = value;
      } else {
        if (!Array.isArray(output[property])) {
          output[property] = [];
        }

        if (index !== undefined) {
          output[property][index] = value;
        } else {
          output[property].push(value);
        }
      }

      return output;
    },
    encode: (expGolomb, input, options, index) => {
      let value;

      if (typeof indexOverride === 'number') {
        index = indexOverride;
      }

      if (!nameArray) {
        value = input[property];
      } else if (Array.isArray(output[property])) {
        if (index !== undefined) {
          value = input[property][index];
        } else {
          value = input[property].shift();
        }
      }

      if (typeof value !== 'number') {
        return;
      }

      value = dataType.write(expGolomb, input, options, index, value);
    }
  };
};

export const debug = function (prefix) {
  return {
    decode: (expGolomb, output, options, index) => {
      console.log(prefix, expGolomb.bitReservoir, output, options, index);
    },
    encode: (expGolomb, input, options, index) => {
      console.log(prefix, expGolomb.bitReservoir, input, options, index);
    }
  };
};

export const verify = function (name) {
  return {
    decode: (expGolomb, output, options, index) => {
      let len = expGolomb.bitReservoir.length;
      if (len !== 0) {
        console.trace('ERROR: ' + name + ' was not completely parsed. There were (' + len + ') bits remaining!');
        console.log(expGolomb.originalBitReservoir);
      }
    },
    encode: (expGolomb, input, options, index) => {}
  };
};

export const pickOptions = function (property, value) {
  return {
    decode: (expGolomb, output, options, index) => {
      if (typeof options[property] !== undefined) {
   //     options[property][value];
      }
    },
    encode: (expGolomb, input, options, index) => {
      if (typeof options[property] !== undefined) {
     //   options.values options[property][value];
      }
    }
  };
};
