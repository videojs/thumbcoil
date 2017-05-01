'use strict';
import {list} from './list';

const nameHandler = function (name) {
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
    property,
    indexOverride,
    nameArray
  };
};

export const when = function (conditionFn, ...parseFns) {
  const parseFn = list(parseFns);

  return {
    decode: (expGolomb, output, options, index) => {
      if (conditionFn(output, options, index)) {
        return parseFn.decode(expGolomb, output, options, index);
      }

      return output;
    },
    encode: (expGolomb, input, options, index) => {
      if (conditionFn(input, options, index)) {
        parseFn.encode(expGolomb, input, options, index);
      }
    }
  };
};

export const each = function (conditionFn, ...parseFns) {
  const parseFn = list(parseFns);

  return {
    decode: (expGolomb, output, options) => {
      let index = 0;

      while (conditionFn(index, output, options)) {
        parseFn.decode(expGolomb, output, options, index);
        index++;
      }

      return output;
    },
    encode: (expGolomb, input, options) => {
      let index = 0;

      while (conditionFn(index, input, options)) {
        parseFn.encode(expGolomb, input, options, index);
        index++;
      }
    }
  };
};

export const inArray = function (name, array) {
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

  return (obj, options, index) => {
    if (nameArray) {
      return (obj[property] && array.indexOf(obj[property][index]) !== -1) ||
        (options[property] && array.indexOf(options[property][index]) !== -1);
    } else {
      return array.indexOf(obj[property]) !== -1 ||
        array.indexOf(options[property]) !== -1;
    }
  };
};

export const equals = function (name, value) {
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

  return (obj, options, index) => {
    if (nameArray) {
      return (obj[property] && obj[property][index] === value) ||
        (options[property] && options[property][index] === value);
    } else {
      return obj[property] === value ||
        options[property] === value;
    }
  };
};

export const gt = function (name, value) {
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

  return (obj, options, index) => {
    if (nameArray) {
      return (obj[property] && obj[property][index] > value) ||
        (options[property] && options[property][index] > value);
    } else {
      return obj[property] > value ||
        options[property] > value;
    }
  };
};

export const not = function (fn) {
  return (obj, options, index) => {
    return !fn(obj, options, index);
  };
};

export const some = function (conditionFns) {
  return (obj, options, index) => {
    return conditionFns.some((fn)=>fn(obj, options, index));
  };
};

export const every = function (conditionFns) {
  return (obj, options, index) => {
    return conditionFns.every((fn)=>fn(obj, options, index));
  };
};

export const whenMoreData = function (...parseFns) {
  const parseFn = list(parseFns);

  return {
    decode: (expGolomb, output, options, index) => {
      if (expGolomb.bitReservoir.length) {
        return parseFn.decode(expGolomb, output, options, index);
      }
      return output;
    },
    encode: (expGolomb, input, options, index) => {
      parseFn.encode(expGolomb, input, options, index);
    }
  };
};


export const whileMoreData = function (...parseFns) {
  const parseFn = list(parseFns);

  return {
    decode: (expGolomb, output, options) => {
      let index = 0;

      while (expGolomb.bitReservoir.length) {
        parseFn.decode(expGolomb, output, options, index);
        index++;
      }

      return output;
    },
    encode: (expGolomb, input, options) => {
      let index = 0;
      let length = 0;

      if (Array.isArray(input)) {
        length = input.length;
      }

      while (index < length) {
        parseFn.encode(expGolomb, input, options, index);
        index++;
      }
    }
  };
};
