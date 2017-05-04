'use strict';
import {list} from './list';
import {propertyHandler} from './property-handler';
import {getProperty, indexArrayMerge} from './property-helpers';

export const when = function (conditionFn, ...parseFns) {
  const parseFn = list(parseFns, true);

  return {
    decode: ({expGolomb, output, options, indexes, path}) => {
      const newPath = path.concat('[when]');

      if (conditionFn(output, options, indexes)) {
        return parseFn.decode({
          expGolomb,
          output,
          options,
          indexes,
          path: newPath
        });
      }

      return output;
    },
    encode: ({expGolomb, input, options, indexes, path}) => {
      const newPath = path.concat('[when]');

      if (conditionFn(input, options, indexes)) {
        parseFn.encode({
          expGolomb,
          input,
          options,
          indexes,
          path: newPath
        });
      }
    }
  };
};

export const each = function (conditionFn, ...parseFns) {
  const parseFn = list(parseFns, true);

  return {
    decode: ({expGolomb, output, options, indexes, path}) => {
      const newPath = path.concat('[each]');
      const indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      while (conditionFn(indexes[indexSlot], output, options)) {
        parseFn.decode({
          expGolomb,
          output,
          options,
          indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;

      return output;
    },
    encode: ({expGolomb, input, options, indexes, path}) => {
      const newPath = path.concat('[each]');
      const indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      while (conditionFn(indexes[indexSlot], input, options)) {
        parseFn.encode({
          expGolomb,
          input,
          options,
          indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;
    }
  };
};

export const inArray = function (name, array) {
  const {propertyName, indexArray} = propertyHandler(name);

  return (obj, options, indexes) => {
    if (indexArray) {
      return array.indexOf(getProperty(obj, options, propertyName, indexArrayMerge(indexes, indexArray))) !== -1;
    } else {
      return array.indexOf(obj[propertyName]) !== -1 ||
        array.indexOf(options[propertyName]) !== -1;
    }
  };
};

export const equals = function (name, value) {
  const {propertyName, indexArray} = propertyHandler(name);

  return (obj, options, indexes) => {
    if (indexArray) {
      return getProperty(obj, options, propertyName, indexArrayMerge(indexes, indexArray)) === value;
    } else {
      return obj[propertyName] === value ||
        options[propertyName] === value;
    }
  };
};

export const gt = function (name, value) {
  const {propertyName, indexArray} = propertyHandler(name);

  return (obj, options, indexes) => {
    if (indexArray) {
      return getProperty(obj, options, propertyName, indexArrayMerge(indexes, indexArray)) === value;
    } else {
      return obj[propertyName] > value ||
        options[propertyName] > value;
    }
  };
};

export const not = function (fn) {
  return (obj, options, indexes) => {
    return !fn(obj, options, indexes);
  };
};

export const some = function (conditionFns) {
  return (obj, options, indexes) => {
    return conditionFns.some((fn)=>fn(obj, options, indexes));
  };
};

export const every = function (conditionFns) {
  return (obj, options, indexes) => {
    return conditionFns.every((fn)=>fn(obj, options, indexes));
  };
};

export const whenMoreData = function (...parseFns) {
  const parseFn = list(parseFns, true);

  return {
    decode: ({expGolomb, output, options, indexes, path}) => {
      const newPath = path.concat('[whenMoreData]');

      if (expGolomb.bitReservoir.length) {
        return parseFn.decode({
          expGolomb,
          output,
          options,
          indexes,
          path: newPath
        });
      }
      return output;
    },
    encode: ({expGolomb, input, options, indexes, path}) => {
      const newPath = path.concat('[whenMoreData]');

      parseFn.encode({
        expGolomb,
        input,
        options,
        indexes,
        path: newPath
      });
    }
  };
};

export const whileMoreData = function (...parseFns) {
  const parseFn = list(parseFns, true);

  return {
    decode: ({expGolomb, output, options, indexes, path}) => {
      const newPath = path.concat('[whileMoreData]');
      const indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      while (expGolomb.bitReservoir.length) {
        parseFn.decode({
          expGolomb,
          output,
          options,
          indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;

      return output;
    },
    encode: ({expGolomb, input, options, indexes, path}) => {
      const newPath = path.concat('[whenMoreData]');
      const indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      let length = 0;

      if (Array.isArray(input)) {
        length = input.length;
      }

      while (index < length) {
        parseFn.encode({
          expGolomb,
          input,
          options,
          indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;
    }
  };
};
