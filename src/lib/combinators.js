'use strict';
import {ExpGolombEncoder, ExpGolombDecoder} from './exp-golomb-string';
import {
  typedArrayToBitString,
  bitStringToTypedArray,
  removeRBSPTrailingBits,
  appendRBSPTrailingBits
} from './rbsp-utils';
import {mergeObj} from './merge-obj';
import {list} from './list';
import {propertyHandler} from './property-handler';
import {getProperty, writeProperty, indexArrayMerge} from './property-helpers';

/**
 * General ExpGolomb-Encoded-Structure Parse Functions
 */
export const start = function (name, ...parseFns) {
  const parseFn = list(parseFns, true);

  return {
    decode: (input, options, output) => {
      const rawBitString = typedArrayToBitString(input);
      let bitString = rawBitString;

      options = options || {};
      output = output || {};

      if (!options.no_trailer_bits) {
        bitString = removeRBSPTrailingBits(rawBitString);
      }

      const expGolombDecoder = new ExpGolombDecoder(bitString);

      try {
        return parseFn.decode({
          options,
          output,
          expGolomb: expGolombDecoder,
          indexes: [],
          path: [name]
        });
      } catch (e) {
        // Ensure that we always return `output` because we might have
        // successfully parsed something!
        return output;
      }
    },
    encode: (input, options) => {
      const expGolombEncoder = new ExpGolombEncoder();

      options = options || {};

      parseFn.encode({
        options,
        input,
        expGolomb: expGolombEncoder,
        indexes: [],
        path: [name]
      });

      const output = expGolombEncoder.bitReservoir;
      const bitString = appendRBSPTrailingBits(output);
      const data = bitStringToTypedArray(bitString);

      return data;
    }
  };
};

export const startArray = function (name, ...parseFns) {
  let startObj = start(name, ...parseFns);

  return {
    decode: (input, options) => {
      return startObj.decode(input, options, []);
    },
    encode: startObj.encode
  };
};

export const data = function (name, dataType) {
  const {propertyName, indexArray} = propertyHandler(name);

  return {
    name: name,
    decode: ({expGolomb, output, options, indexes, path}) => {
      let value;

      try {
        value = dataType.read(expGolomb, output, options, indexes);
      } catch (e) {
        output['Parse Error:'] = `${e.message} at ${path.join('/')}`;
        throw e;
      }

      if (!indexArray) {
        output[propertyName] = value;
      } else {
        writeProperty(output, options, propertyName, indexArrayMerge(indexes, indexArray), value);
      }

      return output;
    },
    encode: ({expGolomb, input, options, indexes, path}) => {
      let value;

      if (!indexArray) {
        value = input[propertyName];
      } else {
        value = getProperty(input, options, propertyName, indexArrayMerge(indexes, indexArray));
      }

      if (typeof value !== 'number') {
        return;
      }

      value = dataType.write(expGolomb, input, options, indexes, value);
    }
  };
};

export const debug = function (prefix) {
  return {
    decode: ({expGolomb, output, options, indexes, path}) => {
      console.log(prefix, path.join(','), expGolomb.bitReservoir, output, options, indexes);
    },
    encode: ({expGolomb, input, options, indexes, path}) => {
      console.log(prefix, path.join(','), expGolomb.bitReservoir, input, options, indexes);
    }
  };
};

export const newObj = (name, ...parseFns) => {
  const {propertyName, indexArray} = propertyHandler(name);
  const parseFn = list(parseFns, true);

  return {
    name: name,
    decode: ({expGolomb, output, options, indexes, path}) => {
      const newPath = path.concat(name);
      const value = parseFn.decode({
        expGolomb,
        output: Object.create(output),
        options,
        indexes,
        path: newPath
      });

      if (!indexArray) {
        output[propertyName] = value;
      } else {
        writeProperty(output, options, propertyName, indexArrayMerge(indexes, indexArray), value);
      }

      return output;
    },
    encode: ({expGolomb, input, options, indexes}) => {
      let value;

      if (!nameArray) {
        value = input[propertyName];
      } else {
        value = getProperty(input, options, propertyName, indexArrayMerge(indexes, indexArray));
      }

      if (typeof value !== 'number') {
        return;
      }

      const newPath = path.concat(name);
      parseFn.encode({
        expGolomb,
        input: value,
        options,
        indexes,
        path: newPath
      });
    }
  };
};

export const verify = function (name) {
  return {
    decode: ({expGolomb, output, options, indexes}) => {
      let len = expGolomb.bitReservoir.length;

      if (len !== 0) {
        output['Validation Error:'] = `${name} was not completely parsed - there were (${len}) bits remaining`;
      }
    },
    encode: ({expGolomb, input, options, indexes}) => {}
  };
};
