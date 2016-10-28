(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.thumbcoil = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _libCombinators = require('./lib/combinators');

var _libDataTypes = require('./lib/data-types');

var audCodec = (0, _libCombinators.start)('access_unit_delimiter', (0, _libCombinators.list)([(0, _libCombinators.data)('primary_pic_type', (0, _libDataTypes.u)(3)), (0, _libCombinators.verify)('access_unit_delimiter')]));

exports['default'] = audCodec;
module.exports = exports['default'];

},{"./lib/combinators":4,"./lib/data-types":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCombinators = require('./lib/combinators');

var _libDataTypes = require('./lib/data-types');

var _libConditionals = require('./lib/conditionals');

var _scalingList = require('./scaling-list');

var _scalingList2 = _interopRequireDefault(_scalingList);

var v = null;

var hdrParameters = (0, _libCombinators.list)([(0, _libCombinators.data)('cpb_cnt_minus1', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('bit_rate_scale', (0, _libDataTypes.u)(4)), (0, _libCombinators.data)('cpb_size_scale', (0, _libDataTypes.u)(4)), (0, _libConditionals.each)(function (index, output) {
  return index <= output.cpb_cnt_minus1;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('bit_rate_value_minus1[]', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('cpb_size_value_minus1[]', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('cbr_flag[]', (0, _libDataTypes.u)(1))])), (0, _libCombinators.data)('initial_cpb_removal_delay_length_minus1', (0, _libDataTypes.u)(5)), (0, _libCombinators.data)('cpb_removal_delay_length_minus1', (0, _libDataTypes.u)(5)), (0, _libCombinators.data)('dpb_output_delay_length_minus1', (0, _libDataTypes.u)(5)), (0, _libCombinators.data)('time_offset_length', (0, _libDataTypes.u)(5))]);

exports['default'] = hdrParameters;
module.exports = exports['default'];

},{"./lib/combinators":4,"./lib/conditionals":5,"./lib/data-types":6,"./scaling-list":11}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _accessUnitDelimiter = require('./access-unit-delimiter');

var _accessUnitDelimiter2 = _interopRequireDefault(_accessUnitDelimiter);

var _seqParameterSet = require('./seq-parameter-set');

var _seqParameterSet2 = _interopRequireDefault(_seqParameterSet);

var _picParameterSet = require('./pic-parameter-set');

var _picParameterSet2 = _interopRequireDefault(_picParameterSet);

var _sliceLayerWithoutPartitioning = require('./slice-layer-without-partitioning');

var _sliceLayerWithoutPartitioning2 = _interopRequireDefault(_sliceLayerWithoutPartitioning);

var _libDiscardEmulationPrevention = require('./lib/discard-emulation-prevention');

var _libDiscardEmulationPrevention2 = _interopRequireDefault(_libDiscardEmulationPrevention);

var h264Codecs = {
  accessUnitDelimiter: _accessUnitDelimiter2['default'],
  seqParameterSet: _seqParameterSet2['default'],
  picParameterSet: _picParameterSet2['default'],
  sliceLayerWithoutPartitioning: _sliceLayerWithoutPartitioning2['default'],
  discardEmulationPrevention: _libDiscardEmulationPrevention2['default']
};

exports['default'] = h264Codecs;
module.exports = exports['default'];

},{"./access-unit-delimiter":1,"./lib/discard-emulation-prevention":7,"./pic-parameter-set":10,"./seq-parameter-set":12,"./slice-layer-without-partitioning":14}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _expGolombString = require('./exp-golomb-string');

var _rbspUtils = require('./rbsp-utils');

/**
 * General ExpGolomb-Encoded-Structure Parse Functions
 */
var start = function start(name, parseFn) {
  return {
    decode: function decode(input, options) {
      var rawBitString = (0, _rbspUtils.typedArrayToBitString)(input);
      var bitString = (0, _rbspUtils.removeRBSPTrailingBits)(rawBitString);
      var expGolombDecoder = new _expGolombString.ExpGolombDecoder(bitString);
      var output = {};

      options = options || {};

      return parseFn.decode(expGolombDecoder, output, options);
    },
    encode: function encode(input, options) {
      var expGolombEncoder = new _expGolombString.ExpGolombEncoder();

      options = options || {};

      parseFn.encode(expGolombEncoder, input, options);

      var output = expGolombEncoder.bitReservoir;
      var bitString = (0, _rbspUtils.appendRBSPTrailingBits)(output);
      var data = (0, _rbspUtils.bitStringToTypedArray)(bitString);

      return data;
    }
  };
};

exports.start = start;
var list = function list(parseFns) {
  return {
    decode: function decode(expGolomb, output, options, index) {
      parseFns.forEach(function (fn) {
        output = fn.decode(expGolomb, output, options, index) || output;
      });

      return output;
    },
    encode: function encode(expGolomb, input, options, index) {
      parseFns.forEach(function (fn) {
        fn.encode(expGolomb, input, options, index);
      });
    }
  };
};

exports.list = list;
var data = function data(name, dataType) {
  var nameSplit = name.split(/\[(\d*)\]/);
  var property = nameSplit[0];
  var indexOverride = undefined;
  var nameArray = undefined;

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
    decode: function decode(expGolomb, output, options, index) {
      var value = undefined;

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
    encode: function encode(expGolomb, input, options, index) {
      var value = undefined;

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

exports.data = data;
var debug = function debug(prefix) {
  return {
    decode: function decode(expGolomb, output, options, index) {
      console.log(prefix, expGolomb.bitReservoir, output, options, index);
    },
    encode: function encode(expGolomb, input, options, index) {
      console.log(prefix, expGolomb.bitReservoir, input, options, index);
    }
  };
};

exports.debug = debug;
var verify = function verify(name) {
  return {
    decode: function decode(expGolomb, output, options, index) {
      var len = expGolomb.bitReservoir.length;
      if (len !== 0) {
        console.trace('ERROR: ' + name + ' was not completely parsed. There were (' + len + ') bits remaining!');
        console.log(expGolomb.originalBitReservoir);
      }
    },
    encode: function encode(expGolomb, input, options, index) {}
  };
};

exports.verify = verify;
var pickOptions = function pickOptions(property, value) {
  return {
    decode: function decode(expGolomb, output, options, index) {
      if (typeof options[property] !== undefined) {
        //     options[property][value];
      }
    },
    encode: function encode(expGolomb, input, options, index) {
      if (typeof options[property] !== undefined) {
        //   options.values options[property][value];
      }
    }
  };
};
exports.pickOptions = pickOptions;

},{"./exp-golomb-string":8,"./rbsp-utils":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var when = function when(conditionFn, parseFn) {
  return {
    decode: function decode(expGolomb, output, options, index) {
      if (conditionFn(output, options, index)) {
        return parseFn.decode(expGolomb, output, options, index);
      }

      return output;
    },
    encode: function encode(expGolomb, input, options, index) {
      if (conditionFn(input, options, index)) {
        parseFn.encode(expGolomb, input, options, index);
      }
    }
  };
};

exports.when = when;
var each = function each(conditionFn, parseFn) {
  return {
    decode: function decode(expGolomb, output, options) {
      var index = 0;

      while (conditionFn(index, output, options)) {
        parseFn.decode(expGolomb, output, options, index);
        index++;
      }

      return output;
    },
    encode: function encode(expGolomb, input, options) {
      var index = 0;

      while (conditionFn(index, input, options)) {
        parseFn.encode(expGolomb, input, options, index);
        index++;
      }
    }
  };
};

exports.each = each;
var inArray = function inArray(name, array) {
  var nameSplit = name.split(/\[(\d*)\]/);
  var property = nameSplit[0];
  var indexOverride = undefined;
  var nameArray = undefined;

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

  return function (obj, options, index) {
    if (nameArray) {
      return obj[property] && array.indexOf(obj[property][index]) !== -1 || options[property] && array.indexOf(options[property][index]) !== -1;
    } else {
      return array.indexOf(obj[property]) !== -1 || array.indexOf(options[property]) !== -1;
    }
  };
};

exports.inArray = inArray;
var equals = function equals(name, value) {
  var nameSplit = name.split(/\[(\d*)\]/);
  var property = nameSplit[0];
  var indexOverride = undefined;
  var nameArray = undefined;

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

  return function (obj, options, index) {
    if (nameArray) {
      return obj[property] && obj[property][index] === value || options[property] && options[property][index] === value;
    } else {
      return obj[property] === value || options[property] === value;
    }
  };
};

exports.equals = equals;
var not = function not(fn) {
  return function (obj, options, index) {
    return !fn(obj, options, index);
  };
};

exports.not = not;
var some = function some(conditionFns) {
  return function (obj, options, index) {
    return conditionFns.some(function (fn) {
      return fn(obj, options, index);
    });
  };
};

exports.some = some;
var every = function every(conditionFns) {
  return function (obj, options, index) {
    return conditionFns.every(function (fn) {
      return fn(obj, options, index);
    });
  };
};

exports.every = every;
var whenMoreData = function whenMoreData(parseFn) {
  return {
    decode: function decode(expGolomb, output, options, index) {
      if (expGolomb.bitReservoir.length) {
        return parseFn.decode(expGolomb, output, options, index);
      }
      return output;
    },
    encode: function encode(expGolomb, input, options, index) {
      parseFn.encode(expGolomb, input, options, index);
    }
  };
};
exports.whenMoreData = whenMoreData;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var getNumBits = function getNumBits(numBits, expGolomb, data, options, index) {
  if (typeof numBits === 'function') {
    return numBits(expGolomb, data, options, index);
  }
  return numBits;
};

var dataTypes = {
  u: function u(numBits) {
    return {
      read: function read(expGolomb, output, options, index) {
        var bitsToRead = getNumBits(numBits, expGolomb, output, options, index);

        return expGolomb.readBits(bitsToRead);
      },
      write: function write(expGolomb, input, options, index, value) {
        var bitsToWrite = getNumBits(numBits, expGolomb, input, options, index);

        expGolomb.writeBits(value, bitsToWrite);
      }
    };
  },
  f: function f(numBits) {
    return {
      read: function read(expGolomb, output, options, index) {
        var bitsToRead = getNumBits(numBits, expGolomb, output, options, index);

        return expGolomb.readBits(bitsToRead);
      },
      write: function write(expGolomb, input, options, index, value) {
        var bitsToWrite = getNumBits(numBits, expGolomb, input, options, index);

        expGolomb.writeBits(value, bitsToWrite);
      }
    };
  },
  ue: function ue() {
    return {
      read: function read(expGolomb, output, options, index) {
        return expGolomb.readUnsignedExpGolomb();
      },
      write: function write(expGolomb, input, options, index, value) {
        expGolomb.writeUnsignedExpGolomb(value);
      }
    };
  },
  se: function se() {
    return {
      read: function read(expGolomb, output, options, index) {
        return expGolomb.readExpGolomb();
      },
      write: function write(expGolomb, input, options, index, value) {
        expGolomb.writeExpGolomb(value);
      }
    };
  },
  b: function b() {
    return {
      read: function read(expGolomb, output, options, index) {
        return expGolomb.readUnsignedByte();
      },
      write: function write(expGolomb, input, options, index, value) {
        expGolomb.writeUnsignedByte(value);
      }
    };
  },
  val: function val(_val) {
    return {
      read: function read(expGolomb, output, options, index) {
        if (typeof _val === 'function') {
          return _val(expGolomb, output, options, index);
        }
        return _val;
      },
      write: function write(expGolomb, input, options, index, value) {
        if (typeof _val === 'function') {
          _val(ExpGolomb, output, options, index);
        }
      }
    };
  }
};

exports['default'] = dataTypes;
module.exports = exports['default'];

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var discardEmulationPreventionBytes = function discardEmulationPreventionBytes(data) {
  var length = data.length;
  var emulationPreventionBytesPositions = [];
  var i = 1;
  var newLength = undefined;
  var newData = undefined;

  // Find all `Emulation Prevention Bytes`
  while (i < length - 2) {
    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0x03) {
      emulationPreventionBytesPositions.push(i + 2);
      i += 2;
    } else {
      i++;
    }
  }

  // If no Emulation Prevention Bytes were found just return the original
  // array
  if (emulationPreventionBytesPositions.length === 0) {
    return data;
  }

  // Create a new array to hold the NAL unit data
  newLength = length - emulationPreventionBytesPositions.length;
  newData = new Uint8Array(newLength);
  var sourceIndex = 0;

  for (i = 0; i < newLength; sourceIndex++, i++) {
    if (sourceIndex === emulationPreventionBytesPositions[0]) {
      // Skip this byte
      sourceIndex++;
      // Remove this position index
      emulationPreventionBytesPositions.shift();
    }
    newData[i] = data[sourceIndex];
  }

  return newData;
};

exports['default'] = discardEmulationPreventionBytes;
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
/**
 * Tools for encoding and decoding ExpGolomb data from a bit-string
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ExpGolombDecoder = function ExpGolombDecoder(bitString) {
  this.bitReservoir = bitString;
  this.originalBitReservoir = bitString;
};

exports.ExpGolombDecoder = ExpGolombDecoder;
ExpGolombDecoder.prototype.countLeadingZeros = function () {
  var i = 0;

  for (var _i = 0; _i < this.bitReservoir.length; _i++) {
    if (this.bitReservoir[_i] === '1') {
      return _i;
    }
  }

  return -1;
};

ExpGolombDecoder.prototype.readUnsignedExpGolomb = function () {
  var zeros = this.countLeadingZeros();
  var bitCount = zeros * 2 + 1;

  var val = parseInt(this.bitReservoir.slice(zeros, bitCount), 2);

  val -= 1;

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readExpGolomb = function () {
  var val = this.readUnsignedExpGolomb();

  if (val !== 0) {
    if (val & 0x1) {
      val = (val + 1) / 2;
    } else {
      val = -(val / 2);
    }
  }

  return val;
};

ExpGolombDecoder.prototype.readBits = function (bitCount) {
  var val = parseInt(this.bitReservoir.slice(0, bitCount), 2);

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readUnsignedByte = function () {
  return this.writeBits(8);
};

var ExpGolombEncoder = function ExpGolombEncoder(bitString) {
  this.bitReservoir = bitString || '';
};

exports.ExpGolombEncoder = ExpGolombEncoder;
ExpGolombEncoder.prototype.writeUnsignedExpGolomb = function (value) {
  var tempStr = '';
  var bitValue = (value + 1).toString(2);
  var numBits = bitValue.length - 1;

  for (var i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + bitValue;
};

ExpGolombEncoder.prototype.writeExpGolomb = function (value) {
  if (value <= 0) {
    value = -value * 2;
  } else {
    value = value * 2 - 1;
  }

  this.writeUnsignedExpGolomb(value);
};

ExpGolombEncoder.prototype.writeBits = function (bitWidth, value) {
  var tempStr = '';
  var bitValue = (value & (1 << bitWidth) - 1).toString(2);
  var numBits = bitWidth - bitValue.length;

  for (var i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + bitValue;
};

ExpGolombEncoder.prototype.writeUnsignedByte = function (value) {
  this.writeBits(8, value);
};

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var typedArrayToBitString = function typedArrayToBitString(data) {
  var array = [];
  var bytesPerElement = data.BYTES_PER_ELEMENT || 1;
  var prefixZeros = '';

  for (var i = 0; i < data.length; i++) {
    array.push(data[i]);
  }

  for (var i = 0; i < bytesPerElement; i++) {
    prefixZeros += '00000000';
  }

  return array.map(function (n) {
    return (prefixZeros + n.toString(2)).slice(-bytesPerElement * 8);
  }).join('');
};

exports.typedArrayToBitString = typedArrayToBitString;
var bitStringToTypedArray = function bitStringToTypedArray(bitString) {
  var bitsNeeded = 8 - bitString.length % 8;

  // Pad with zeros to make length a multiple of 8
  for (var i = 0; bitsNeeded !== 8 && i < bitsNeeded; i++) {
    bitString += '0';
  }

  var outputArray = bitString.match(/(.{8})/g);
  var numberArray = outputArray.map(function (n) {
    return parseInt(n, 2);
  });

  return new Uint8Array(numberArray);
};

exports.bitStringToTypedArray = bitStringToTypedArray;
var removeRBSPTrailingBits = function removeRBSPTrailingBits(bits) {
  return bits.split(/10*$/)[0];
};

exports.removeRBSPTrailingBits = removeRBSPTrailingBits;
var appendRBSPTrailingBits = function appendRBSPTrailingBits(bits) {
  var bitString = bits + '10000000';

  return bitString.slice(0, -(bitString.length % 8));
};
exports.appendRBSPTrailingBits = appendRBSPTrailingBits;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCombinators = require('./lib/combinators');

var _libConditionals = require('./lib/conditionals');

var _libDataTypes = require('./lib/data-types');

var _scalingList = require('./scaling-list');

var _scalingList2 = _interopRequireDefault(_scalingList);

var v = null;

var ppsCodec = (0, _libCombinators.start)('pic_parameter_set', (0, _libCombinators.list)([(0, _libCombinators.data)('pic_parameter_set_id', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('seq_parameter_set_id', (0, _libDataTypes.ue)(v)),
//    pickOptions('sps', 'seq_parameter_set_id'),
(0, _libCombinators.data)('entropy_coding_mode_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('bottom_field_pic_order_in_frame_present_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('num_slice_groups_minus1', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('num_slice_groups_minus1', 0)), (0, _libCombinators.list)([(0, _libCombinators.data)('slice_group_map_type', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.equals)('slice_group_map_type', 0), (0, _libConditionals.each)(function (index, output) {
  return index <= output.num_slice_groups_minus1;
}, (0, _libCombinators.data)('run_length_minus1[]', (0, _libDataTypes.ue)(v)))), (0, _libConditionals.when)((0, _libConditionals.equals)('slice_group_map_type', 2), (0, _libConditionals.each)(function (index, output) {
  return index <= output.num_slice_groups_minus1;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('top_left[]', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('bottom_right[]', (0, _libDataTypes.ue)(v))]))), (0, _libConditionals.when)((0, _libConditionals.inArray)('slice_group_map_type', [3, 4, 5]), (0, _libCombinators.list)([(0, _libCombinators.data)('slice_group_change_direction_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('slice_group_change_rate_minus1', (0, _libDataTypes.ue)(v))])), (0, _libConditionals.when)((0, _libConditionals.equals)('slice_group_map_type', 6), (0, _libCombinators.list)([(0, _libCombinators.data)('pic_size_in_map_units_minus1', (0, _libDataTypes.ue)(v)), (0, _libConditionals.each)(function (index, output) {
  return index <= output.pic_size_in_map_units_minus1;
}, (0, _libCombinators.data)('slice_group_id[]', (0, _libDataTypes.ue)(v)))]))])), (0, _libCombinators.data)('num_ref_idx_l0_default_active_minus1', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('num_ref_idx_l1_default_active_minus1', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('weighted_pred_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('weighted_bipred_idc', (0, _libDataTypes.u)(2)), (0, _libCombinators.data)('pic_init_qp_minus26', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('pic_init_qs_minus26', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_qp_index_offset', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('deblocking_filter_control_present_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constrained_intra_pred_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('redundant_pic_cnt_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.whenMoreData)((0, _libCombinators.list)([(0, _libCombinators.data)('transform_8x8_mode_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('pic_scaling_matrix_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('pic_scaling_matrix_present_flag', 1), (0, _libConditionals.each)(function (index, output) {
  return index < 6 + (output.chroma_format_Idc !== 3 ? 2 : 6) * output.transform_8x8_mode_flag;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('pic_scaling_list_present_flag[]', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('pic_scaling_list_present_flag[]', 1), _scalingList2['default'])]))), (0, _libCombinators.data)('second_chroma_qp_index_offset', (0, _libDataTypes.se)(v))])), (0, _libCombinators.verify)('pic_parameter_set')]));

exports['default'] = ppsCodec;
module.exports = exports['default'];

},{"./lib/combinators":4,"./lib/conditionals":5,"./lib/data-types":6,"./scaling-list":11}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var scalingList = {
  decode: function decode(expGolomb, output, options, index) {
    var lastScale = 8;
    var nextScale = 8;
    var deltaScale = undefined;
    var count = 16;
    var scalingArr = [];

    if (!Array.isArray(output.scalingList)) {
      output.scalingList = [];
    }

    if (index >= 6) {
      count = 64;
    }

    for (var j = 0; j < count; j++) {
      if (nextScale !== 0) {
        deltaScale = expGolomb.readExpGolomb();
        nextScale = (lastScale + deltaScale + 256) % 256;
      }

      scalingArr[j] = nextScale === 0 ? lastScale : nextScale;
      lastScale = scalingArr[j];
    }

    output.scalingList[index] = scalingArr;

    return output;
  },
  encode: function encode(expGolomb, input, options, index) {
    var lastScale = 8;
    var nextScale = 8;
    var deltaScale = undefined;
    var count = 16;
    var output = '';

    if (!Array.isArray(input.scalingList)) {
      return '';
    }

    if (index >= 6) {
      count = 64;
    }

    var scalingArr = output.scalingList[index];

    for (var j = 0; j < count; j++) {
      if (scalingArr[j] === lastScale) {
        output += expGolomb.writeExpGolomb(-lastScale);
        break;
      }
      nextScale = scalingArr[j] - lastScale;
      output += expGolomb.writeExpGolomb(nextScale);
      lastScale = scalingArr[j];
    }
    return output;
  }
};

exports['default'] = scalingList;
module.exports = exports['default'];

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCombinators = require('./lib/combinators');

var _libConditionals = require('./lib/conditionals');

var _libDataTypes = require('./lib/data-types');

var _scalingList = require('./scaling-list');

var _scalingList2 = _interopRequireDefault(_scalingList);

var _vuiParameters = require('./vui-parameters');

var _vuiParameters2 = _interopRequireDefault(_vuiParameters);

var v = null;

var PROFILES_WITH_OPTIONAL_SPS_DATA = [44, 83, 86, 100, 110, 118, 122, 128, 134, 138, 139, 244];

var getChromaFormatIdcValue = {
  read: function read(expGolomb, output, options, index) {
    return output.chroma_format_idc || options.chroma_format_idc;
  },
  write: function write() {}
};

/**
  * NOW we are ready to build an SPS parser!
  */
var spsCodec = (0, _libCombinators.start)('seq_parameter_set', (0, _libCombinators.list)([
// defaults
(0, _libCombinators.data)('chroma_format_idc', (0, _libDataTypes.val)(1)), (0, _libCombinators.data)('video_format', (0, _libDataTypes.val)(5)), (0, _libCombinators.data)('color_primaries', (0, _libDataTypes.val)(2)), (0, _libCombinators.data)('transfer_characteristics', (0, _libDataTypes.val)(2)), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(1.0)), (0, _libCombinators.data)('profile_idc', (0, _libDataTypes.u)(8)), (0, _libCombinators.data)('constraint_set0_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set1_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set2_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set3_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set4_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set5_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set6_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('constraint_set7_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('level_idc', (0, _libDataTypes.u)(8)), (0, _libCombinators.data)('seq_parameter_set_id', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.inArray)('profile_idc', PROFILES_WITH_OPTIONAL_SPS_DATA), (0, _libCombinators.list)([(0, _libCombinators.data)('chroma_format_idc', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.equals)('chroma_format_idc', 3), (0, _libCombinators.data)('separate_colour_plane_flag', (0, _libDataTypes.u)(1))), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('chroma_format_idc', 3)), (0, _libCombinators.data)('separate_colour_plane_flag', (0, _libDataTypes.val)(0))), (0, _libCombinators.data)('bit_depth_luma_minus8', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('bit_depth_chroma_minus8', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('qpprime_y_zero_transform_bypass_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('seq_scaling_matrix_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('seq_scaling_matrix_present_flag', 1), (0, _libConditionals.each)(function (index, output) {
  return index < (output.chroma_format_idc !== 3 ? 8 : 12);
}, (0, _libCombinators.list)([(0, _libCombinators.data)('seq_scaling_list_present_flag[]', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('seq_scaling_list_present_flag[]', 1), _scalingList2['default'])])))])), (0, _libCombinators.data)('log2_max_frame_num_minus4', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('pic_order_cnt_type', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.equals)('pic_order_cnt_type', 0), (0, _libCombinators.data)('log2_max_pic_order_cnt_lsb_minus4', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.equals)('pic_order_cnt_type', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('delta_pic_order_always_zero_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('offset_for_non_ref_pic', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('offset_for_top_to_bottom_field', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('num_ref_frames_in_pic_order_cnt_cycle', (0, _libDataTypes.ue)(v)), (0, _libConditionals.each)(function (index, output) {
  return index < output.num_ref_frames_in_pic_order_cnt_cycle;
}, (0, _libCombinators.data)('offset_for_ref_frame[]', (0, _libDataTypes.se)(v)))])), (0, _libCombinators.data)('max_num_ref_frames', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('gaps_in_frame_num_value_allowed_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('pic_width_in_mbs_minus1', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('pic_height_in_map_units_minus1', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('frame_mbs_only_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('frame_mbs_only_flag', 0), (0, _libCombinators.data)('mb_adaptive_frame_field_flag', (0, _libDataTypes.u)(1))), (0, _libCombinators.data)('direct_8x8_inference_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('frame_cropping_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('frame_cropping_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('frame_crop_left_offset', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('frame_crop_right_offset', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('frame_crop_top_offset', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('frame_crop_bottom_offset', (0, _libDataTypes.ue)(v))])), (0, _libCombinators.data)('vui_parameters_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('vui_parameters_present_flag', 1), _vuiParameters2['default']),
// The following field is a derived value that is used for parsing
// slice headers
(0, _libConditionals.when)((0, _libConditionals.equals)('separate_colour_plane_flag', 1), (0, _libCombinators.data)('ChromaArrayType', (0, _libDataTypes.val)(0))), (0, _libConditionals.when)((0, _libConditionals.equals)('separate_colour_plane_flag', 0), (0, _libCombinators.data)('ChromaArrayType', getChromaFormatIdcValue)), (0, _libCombinators.verify)('seq_parameter_set')]));

exports['default'] = spsCodec;
module.exports = exports['default'];

},{"./lib/combinators":4,"./lib/conditionals":5,"./lib/data-types":6,"./scaling-list":11,"./vui-parameters":15}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _libCombinators = require('./lib/combinators');

var _libConditionals = require('./lib/conditionals');

var _libDataTypes = require('./lib/data-types');

var v = null;

var sliceType = {
  P: [0, 5],
  B: [1, 6],
  I: [2, 7],
  SP: [3, 8],
  SI: [4, 9]
};

/**
 * Functions for calculating the number of bits to read for certain
 * properties based on the values in other properties (usually specified
 * in the SPS)
 */
var frameNumBits = function frameNumBits(expGolomb, data, options, index) {
  return options.log2_max_frame_num_minus4 + 4;
};

var picOrderCntBits = function picOrderCntBits(expGolomb, data, options, index) {
  return options.log2_max_pic_order_cnt_lsb_minus4 + 4;
};

var sliceGroupChangeCycleBits = function sliceGroupChangeCycleBits(expGolomb, data, options, index) {
  var picHeightInMapUnits = options.pic_height_in_map_units_minus1 + 1;
  var picWidthInMbs = options.pic_width_in_mbs_minus1 + 1;
  var sliceGroupChangeRate = options.slice_group_change_rate_minus1 + 1;
  var picSizeInMapUnits = picWidthInMbs * picHeightInMapUnits;

  return Math.ceil(Math.log(picSizeInMapUnits / sliceGroupChangeRate + 1) / Math.LN2);
};

var useWeightedPredictionTable = (0, _libConditionals.some)([(0, _libConditionals.every)([(0, _libConditionals.equals)('weighted_pred_flag', 1), (0, _libConditionals.some)([(0, _libConditionals.inArray)('slice_type', sliceType.P), (0, _libConditionals.inArray)('slice_type', sliceType.SP)])]), (0, _libConditionals.every)([(0, _libConditionals.equals)('weighted_bipred_idc', 1), (0, _libConditionals.inArray)('slice_type', sliceType.B)])]);

var refPicListModification = (0, _libCombinators.list)([(0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.not)((0, _libConditionals.inArray)('slice_type', sliceType.I)), (0, _libConditionals.not)((0, _libConditionals.inArray)('slice_type', sliceType.SI))]), (0, _libCombinators.list)([(0, _libCombinators.data)('ref_pic_list_modification_flag_l0', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('ref_pic_list_modification_flag_l0', 1), (0, _libConditionals.each)(function (index, output) {
  return index === 0 || output.modification_of_pic_nums_idc_l0[index - 1] !== 3;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('modification_of_pic_nums_idc_l0[]', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.inArray)('modification_of_pic_nums_idc_l0[]', [0, 1]), (0, _libCombinators.data)('abs_diff_pic_num_minus1_l0[]', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.equals)('modification_of_pic_nums_idc_l0[]', 2), (0, _libCombinators.data)('long_term_pic_num_l0[]', (0, _libDataTypes.ue)(v)))])))])), (0, _libConditionals.when)((0, _libConditionals.inArray)('slice_type', sliceType.B), (0, _libCombinators.list)([(0, _libCombinators.data)('ref_pic_list_modification_flag_l1', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('ref_pic_list_modification_flag_l1', 1), (0, _libConditionals.each)(function (index, output) {
  return index === 0 || output.modification_of_pic_nums_idc_l1[index - 1] !== 3;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('modification_of_pic_nums_idc_l1[]', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.inArray)('modification_of_pic_nums_idc_l1[]', [0, 1]), (0, _libCombinators.data)('abs_diff_pic_num_minus1_l1[]', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.equals)('modification_of_pic_nums_idc_l1[]', 2), (0, _libCombinators.data)('long_term_pic_num_l1[]', (0, _libDataTypes.ue)(v)))])))]))]);

var refPicListMvcModification = {
  encode: function encode() {
    throw new Error('ref_pic_list_mvc_modification: NOT IMPLEMENTED!');
  },
  decode: function decode() {
    throw new Error('ref_pic_list_mvc_modification: NOT IMPLEMENTED!');
  }
};

var predWeightTable = (0, _libCombinators.list)([(0, _libCombinators.data)('luma_log2_weight_denom', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('ChromaArrayType', 0)), (0, _libCombinators.data)('chroma_log2_weight_denom', (0, _libDataTypes.ue)(v))), (0, _libConditionals.each)(function (index, output) {
  return index <= output.num_ref_idx_l0_active_minus1;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('luma_weight_l0_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('luma_weight_l0_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('luma_weight_l0[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('luma_offset_l0[]', (0, _libDataTypes.se)(v)), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('ChromaArrayType', 0)), (0, _libCombinators.list)([(0, _libCombinators.data)('chroma_weight_l0_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('chroma_weight_l0_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('chroma_weight_l0_Cr[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_offset_l0_Cr[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_weight_l0_Cb[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_offset_l0_Cb[]', (0, _libDataTypes.se)(v))]))]))]))])), (0, _libConditionals.when)((0, _libConditionals.inArray)('slice_type', sliceType.B), (0, _libConditionals.each)(function (index, output) {
  return index <= output.num_ref_idx_l1_active_minus1;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('luma_weight_l1_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('luma_weight_l1_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('luma_weight_l1[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('luma_offset_l1[]', (0, _libDataTypes.se)(v)), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('ChromaArrayType', 0)), (0, _libCombinators.list)([(0, _libCombinators.data)('chroma_weight_l1_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('chroma_weight_l1_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('chroma_weight_l1_Cr[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_offset_l1_Cr[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_weight_l1_Cb[]', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('chroma_offset_l1_Cb[]', (0, _libDataTypes.se)(v))]))]))]))])))]);

var decRefPicMarking = (0, _libCombinators.list)([(0, _libConditionals.when)((0, _libConditionals.equals)('nal_unit_type', 5), (0, _libCombinators.list)([(0, _libCombinators.data)('no_output_of_prior_pics_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('long_term_reference_flag', (0, _libDataTypes.u)(1))])), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('nal_unit_type', 5)), (0, _libCombinators.list)([(0, _libCombinators.data)('adaptive_ref_pic_marking_mode_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('adaptive_ref_pic_marking_mode_flag', 1), (0, _libConditionals.each)(function (index, output) {
  return index === 0 || output.memory_management_control_operation[index - 1] !== 0;
}, (0, _libCombinators.list)([(0, _libCombinators.data)('memory_management_control_operation[]', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.inArray)('memory_management_control_operation[]', [1, 3]), (0, _libCombinators.data)('difference_of_pic_nums_minus1[]', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.inArray)('memory_management_control_operation[]', [2]), (0, _libCombinators.data)('long_term_pic_num[]', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.inArray)('memory_management_control_operation[]', [3, 6]), (0, _libCombinators.data)('long_term_frame_idx[]', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.inArray)('memory_management_control_operation[]', [4]), (0, _libCombinators.data)('max_long_term_frame_idx_plus1[]', (0, _libDataTypes.ue)(v)))])))]))]);

var sliceHeader = (0, _libCombinators.list)([(0, _libCombinators.data)('first_mb_in_slice', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('slice_type', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('pic_parameter_set_id', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.equals)('separate_colour_plane_flag', 1), (0, _libCombinators.data)('colour_plane_id', (0, _libDataTypes.u)(2))), (0, _libCombinators.data)('frame_num', (0, _libDataTypes.u)(frameNumBits)), (0, _libConditionals.when)((0, _libConditionals.equals)('frame_mbs_only_flag', 0), (0, _libCombinators.list)([(0, _libCombinators.data)('field_pic_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('field_pic_flag', 1), (0, _libCombinators.data)('bottom_field_flag', (0, _libDataTypes.u)(1)))])), (0, _libConditionals.when)((0, _libConditionals.equals)('idrPicFlag', 1), (0, _libCombinators.data)('idr_pic_id', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.equals)('pic_order_cnt_type', 0), (0, _libCombinators.list)([(0, _libCombinators.data)('pic_order_cnt_lsb', (0, _libDataTypes.u)(picOrderCntBits)), (0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.equals)('bottom_field_pic_order_in_frame_present_flag', 1), (0, _libConditionals.not)((0, _libConditionals.equals)('field_pic_flag', 1))]), (0, _libCombinators.data)('delta_pic_order_cnt_bottom', (0, _libDataTypes.se)(v)))])), (0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.equals)('pic_order_cnt_type', 1), (0, _libConditionals.not)((0, _libConditionals.equals)('delta_pic_order_always_zero_flag', 1))]), (0, _libCombinators.list)([(0, _libCombinators.data)('delta_pic_order_cnt[0]', (0, _libDataTypes.se)(v)), (0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.equals)('bottom_field_pic_order_in_frame_present_flag', 1), (0, _libConditionals.not)((0, _libConditionals.equals)('field_pic_flag', 1))]), (0, _libCombinators.data)('delta_pic_order_cnt[1]', (0, _libDataTypes.se)(v)))])), (0, _libConditionals.when)((0, _libConditionals.equals)('redundant_pic_cnt_present_flag', 1), (0, _libCombinators.data)('redundant_pic_cnt', (0, _libDataTypes.ue)(v))), (0, _libConditionals.when)((0, _libConditionals.inArray)('slice_type', sliceType.B), (0, _libCombinators.data)('direct_spatial_mv_pred_flag', (0, _libDataTypes.u)(1))), (0, _libConditionals.when)((0, _libConditionals.some)([(0, _libConditionals.inArray)('slice_type', sliceType.P), (0, _libConditionals.inArray)('slice_type', sliceType.SP), (0, _libConditionals.inArray)('slice_type', sliceType.B)]), (0, _libCombinators.list)([(0, _libCombinators.data)('num_ref_idx_active_override_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('num_ref_idx_active_override_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('num_ref_idx_l0_active_minus1', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.inArray)('slice_type', sliceType.B), (0, _libCombinators.data)('num_ref_idx_l1_active_minus1', (0, _libDataTypes.ue)(v)))]))])), (0, _libConditionals.when)((0, _libConditionals.some)([(0, _libConditionals.equals)('nal_unit_type', 20), (0, _libConditionals.equals)('nal_unit_type', 21)]), refPicListMvcModification), (0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.not)((0, _libConditionals.equals)('nal_unit_type', 20)), (0, _libConditionals.not)((0, _libConditionals.equals)('nal_unit_type', 21))]), refPicListModification), (0, _libConditionals.when)(useWeightedPredictionTable, predWeightTable), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('nal_ref_idc', 0)), decRefPicMarking), (0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.equals)('entropy_coding_mode_flag', 1), (0, _libConditionals.not)((0, _libConditionals.inArray)('slice_type', sliceType.I)), (0, _libConditionals.not)((0, _libConditionals.inArray)('slice_type', sliceType.SI))]), (0, _libCombinators.data)('cabac_init_idc', (0, _libDataTypes.ue)(v))), (0, _libCombinators.data)('slice_qp_delta', (0, _libDataTypes.se)(v)), (0, _libConditionals.when)((0, _libConditionals.inArray)('slice_type', sliceType.SP), (0, _libCombinators.data)('sp_for_switch_flag', (0, _libDataTypes.u)(1))), (0, _libConditionals.when)((0, _libConditionals.some)([(0, _libConditionals.inArray)('slice_type', sliceType.SP), (0, _libConditionals.inArray)('slice_type', sliceType.SI)]), (0, _libCombinators.data)('slice_qs_delta', (0, _libDataTypes.se)(v))), (0, _libConditionals.when)((0, _libConditionals.equals)('deblocking_filter_control_present_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('disable_deblocking_filter_idc', (0, _libDataTypes.ue)(v)), (0, _libConditionals.when)((0, _libConditionals.not)((0, _libConditionals.equals)('disable_deblocking_filter_idc', 1)), (0, _libCombinators.list)([(0, _libCombinators.data)('slice_alpha_c0_offset_div2', (0, _libDataTypes.se)(v)), (0, _libCombinators.data)('slice_beta_offset_div2', (0, _libDataTypes.se)(v))]))])), (0, _libConditionals.when)((0, _libConditionals.every)([(0, _libConditionals.not)((0, _libConditionals.equals)('num_slice_groups_minus1', 0)), (0, _libConditionals.some)([(0, _libConditionals.equals)('slice_group_map_type', 3), (0, _libConditionals.equals)('slice_group_map_type', 4), (0, _libConditionals.equals)('slice_group_map_type', 5)])]), (0, _libCombinators.data)('slice_group_change_cycle', (0, _libDataTypes.u)(sliceGroupChangeCycleBits)))]);

exports['default'] = sliceHeader;
module.exports = exports['default'];

},{"./lib/combinators":4,"./lib/conditionals":5,"./lib/data-types":6}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _sliceHeader = require('./slice-header');

var _sliceHeader2 = _interopRequireDefault(_sliceHeader);

var _libCombinators = require('./lib/combinators');

var sliceLayerWithoutPartitioningCodec = (0, _libCombinators.start)('slice_layer_without_partitioning', (0, _libCombinators.list)([_sliceHeader2['default']
// TODO: slice_data
]));

exports['default'] = sliceLayerWithoutPartitioningCodec;
module.exports = exports['default'];

},{"./lib/combinators":4,"./slice-header":13}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCombinators = require('./lib/combinators');

var _libConditionals = require('./lib/conditionals');

var _libDataTypes = require('./lib/data-types');

var _hdrParameters = require('./hdr-parameters');

var _hdrParameters2 = _interopRequireDefault(_hdrParameters);

var v = null;

var sampleRatioCalc = (0, _libCombinators.list)([
/*
  1:1
 7680x4320 16:9 frame without horizontal overscan
 3840x2160 16:9 frame without horizontal overscan
 1280x720 16:9 frame without horizontal overscan
 1920x1080 16:9 frame without horizontal overscan (cropped from 1920x1088)
 640x480 4:3 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 1), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(1))),
/*
  12:11
 720x576 4:3 frame with horizontal overscan
 352x288 4:3 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 2), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(12 / 11))),
/*
  10:11
 720x480 4:3 frame with horizontal overscan
 352x240 4:3 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 3), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(10 / 11))),
/*
  16:11
 720x576 16:9 frame with horizontal overscan
 528x576 4:3 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 4), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(16 / 11))),
/*
  40:33
 720x480 16:9 frame with horizontal overscan
 528x480 4:3 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 5), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(40 / 33))),
/*
  24:11
 352x576 4:3 frame without horizontal overscan
 480x576 16:9 frame with horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 6), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(24 / 11))),
/*
  20:11
 352x480 4:3 frame without horizontal overscan
 480x480 16:9 frame with horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 7), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(20 / 11))),
/*
  32:11
 352x576 16:9 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 8), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(32 / 11))),
/*
  80:33
 352x480 16:9 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 9), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(80 / 33))),
/*
  18:11
 480x576 4:3 frame with horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 10), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(18 / 11))),
/*
  15:11
 480x480 4:3 frame with horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 11), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(15 / 11))),
/*
  64:33
 528x576 16:9 frame with horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 12), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(64 / 33))),
/*
  160:99
 528x480 16:9 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 13), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(160 / 99))),
/*
  4:3
 1440x1080 16:9 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 14), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(4 / 3))),
/*
  3:2
 1280x1080 16:9 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 15), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(3 / 2))),
/*
  2:1
 960x1080 16:9 frame without horizontal overscan
 */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 16), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(2 / 1))),
/* Extended_SAR */
(0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_idc', 255), (0, _libCombinators.list)([(0, _libCombinators.data)('sar_width', (0, _libDataTypes.u)(16)), (0, _libCombinators.data)('sar_height', (0, _libDataTypes.u)(16)), (0, _libCombinators.data)('sample_ratio', (0, _libDataTypes.val)(function (expGolomb, output, options) {
  return output.sar_width / output.sar_height;
}))]))]);

var vuiParamters = (0, _libCombinators.list)([(0, _libCombinators.data)('aspect_ratio_info_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('aspect_ratio_info_present_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('aspect_ratio_idc', (0, _libDataTypes.u)(8)), sampleRatioCalc])), (0, _libCombinators.data)('overscan_info_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('overscan_info_present_flag', 1), (0, _libCombinators.data)('overscan_appropriate_flag', (0, _libDataTypes.u)(1))), (0, _libCombinators.data)('video_signal_type_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('video_signal_type_present_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('video_format', (0, _libDataTypes.u)(3)), (0, _libCombinators.data)('video_full_range_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('colour_description_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('colour_description_present_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('colour_primaries', (0, _libDataTypes.u)(8)), (0, _libCombinators.data)('transfer_characteristics', (0, _libDataTypes.u)(8)), (0, _libCombinators.data)('matrix_coefficients', (0, _libDataTypes.u)(8))]))])), (0, _libCombinators.data)('chroma_loc_info_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('chroma_loc_info_present_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('chroma_sample_loc_type_top_field', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('chroma_sample_loc_type_bottom_field', (0, _libDataTypes.ue)(v))])), (0, _libCombinators.data)('timing_info_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('timing_info_present_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('num_units_in_tick', (0, _libDataTypes.u)(32)), (0, _libCombinators.data)('time_scale', (0, _libDataTypes.u)(32)), (0, _libCombinators.data)('fixed_frame_rate_flag', (0, _libDataTypes.u)(1))])), (0, _libCombinators.data)('nal_hrd_parameters_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('nal_hrd_parameters_present_flag', 1), _hdrParameters2['default']), (0, _libCombinators.data)('vcl_hrd_parameters_present_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('vcl_hrd_parameters_present_flag', 1), _hdrParameters2['default']), (0, _libConditionals.when)((0, _libConditionals.some)([(0, _libConditionals.equals)('nal_hrd_parameters_present_flag', 1), (0, _libConditionals.equals)('vcl_hrd_parameters_present_flag', 1)]), (0, _libCombinators.data)('low_delay_hrd_flag', (0, _libDataTypes.u)(1))), (0, _libCombinators.data)('pic_struct_present_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('bitstream_restriction_flag', (0, _libDataTypes.u)(1)), (0, _libConditionals.when)((0, _libConditionals.equals)('bitstream_restriction_flag', 1), (0, _libCombinators.list)([(0, _libCombinators.data)('motion_vectors_over_pic_boundaries_flag', (0, _libDataTypes.u)(1)), (0, _libCombinators.data)('max_bytes_per_pic_denom', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('max_bits_per_mb_denom', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('log2_max_mv_length_horizontal', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('log2_max_mv_length_vertical', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('max_num_reorder_frames', (0, _libDataTypes.ue)(v)), (0, _libCombinators.data)('max_dec_frame_buffering', (0, _libDataTypes.ue)(v))]))]);

exports['default'] = vuiParamters;
module.exports = exports['default'];

},{"./hdr-parameters":2,"./lib/combinators":4,"./lib/conditionals":5,"./lib/data-types":6}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bitStreamsH264 = require('./bit-streams/h264');

var _bitStreamsH2642 = _interopRequireDefault(_bitStreamsH264);

var _inspectors = require('./inspectors');

var thumbCoil = {
  h264Codecs: _bitStreamsH2642['default'],
  mp4Inspector: _inspectors.mp4Inspector,
  tsInspector: _inspectors.tsInspector,
  flvInspector: _inspectors.flvInspector
};

// Include the version number.
thumbCoil.VERSION = '1.1.0';

exports['default'] = thumbCoil;
module.exports = exports['default'];

},{"./bit-streams/h264":3,"./inspectors":20}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var dataToHex = function dataToHex(value, indent) {
  // print out raw bytes as hexademical
  var bytes = Array.prototype.slice.call(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)).map(function (byte) {
    return ('00' + byte.toString(16)).slice(-2);
  }).reduce(groupBy(8), []).map(function (a) {
    return a.join(' ');
  }).reduce(groupBy(2), []).map(function (a) {
    return a.join('  ');
  }).join('').match(/.{1,48}/g);

  if (!bytes) {
    return '<>';
  }

  if (bytes.length === 1) {
    return bytes.join('').slice(1);
  }

  return bytes.map(function (line) {
    return indent + line;
  }).join('\n');
};

var groupBy = function groupBy(count) {
  return function (p, c) {
    var last = p.pop();

    if (!last) {
      last = [];
    } else if (last.length === count) {
      p.push(last);
      last = [];
    }
    last.push(c);
    p.push(last);
    return p;
  };
};

exports['default'] = dataToHex;
module.exports = exports['default'];

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _bitStreamsH264 = require('../../bit-streams/h264');

var lastSPS = undefined;
var lastPPS = undefined;
var lastOptions = undefined;

var mergePS = function mergePS(a, b) {
  var newObj = {};

  if (a) {
    Object.keys(a).forEach(function (key) {
      newObj[key] = a[key];
    });
  }

  if (b) {
    Object.keys(b).forEach(function (key) {
      newObj[key] = b[key];
    });
  }

  return newObj;
};

exports.mergePS = mergePS;
var nalParseAVCC = function nalParseAVCC(avcStream) {
  var avcView = new DataView(avcStream.buffer, avcStream.byteOffset, avcStream.byteLength),
      result = [],
      nalData,
      i,
      length;

  for (i = 0; i + 4 < avcStream.length; i += length) {
    length = avcView.getUint32(i);
    i += 4;

    // bail if this doesn't appear to be an H264 stream
    if (length <= 0) {
      result.push({
        type: 'MALFORMED-DATA'
      });
      continue;
    }
    if (length > avcStream.length) {
      result.push({
        type: 'UNKNOWN MDAT DATA'
      });
      return;
    }

    var nalUnit = avcStream.subarray(i, i + length);

    result.push(nalParse(nalUnit));
  }

  return result;
};

exports.nalParseAVCC = nalParseAVCC;
var nalParseAnnexB = function nalParseAnnexB(buffer) {
  var syncPoint = 0;
  var i = undefined;
  var result = [];

  // Rec. ITU-T H.264, Annex B
  // scan for NAL unit boundaries

  // a match looks like this:
  // 0 0 1 .. NAL .. 0 0 1
  // ^ sync point        ^ i
  // or this:
  // 0 0 1 .. NAL .. 0 0 0
  // ^ sync point        ^ i

  // advance the sync point to a NAL start, if necessary
  for (; syncPoint < buffer.byteLength - 3; syncPoint++) {
    if (buffer[syncPoint] === 0 && buffer[syncPoint + 1] === 0 && buffer[syncPoint + 2] === 1) {
      // the sync point is properly aligned
      i = syncPoint + 5;
      break;
    }
  }

  while (i < buffer.byteLength) {
    if (syncPoint === undefined) {
      debugger;
    }
    // look at the current byte to determine if we've hit the end of
    // a NAL unit boundary
    switch (buffer[i]) {
      case 0:
        // skip past non-sync sequences
        if (buffer[i - 1] !== 0) {
          i += 2;
          break;
        } else if (buffer[i - 2] !== 0) {
          i++;
          break;
        }

        // deliver the NAL unit if it isn't empty
        if (syncPoint + 3 !== i - 2) {
          result.push(nalParse(buffer.subarray(syncPoint + 3, i - 2)));
        }

        // drop trailing zeroes
        do {
          i++;
        } while (buffer[i] !== 1 && i < buffer.length);
        syncPoint = i - 2;
        i += 3;
        break;
      case 1:
        // skip past non-sync sequences
        if (buffer[i - 1] !== 0 || buffer[i - 2] !== 0) {
          i += 3;
          break;
        }

        // deliver the NAL unit
        result.push(nalParse(buffer.subarray(syncPoint + 3, i - 2)));
        syncPoint = i - 2;
        i += 3;
        break;
      default:
        // the current byte isn't a one or zero, so it cannot be part
        // of a sync sequence
        i += 3;
        break;
    }
  }
  // filter out the NAL units that were delivered
  buffer = buffer.subarray(syncPoint);
  i -= syncPoint;
  syncPoint = 0;

  // deliver the last buffered NAL unit
  if (buffer && buffer.byteLength > 3) {
    result.push(nalParse(buffer.subarray(syncPoint + 3)));
  }

  return result;
};

exports.nalParseAnnexB = nalParseAnnexB;
var nalParse = function nalParse(nalUnit) {
  var nalData = undefined;

  if (nalUnit.length > 1) {
    nalData = (0, _bitStreamsH264.discardEmulationPrevention)(nalUnit.subarray(1));
  } else {
    nalData = nalUnit;
  }

  var nalUnitType = nalUnit[0] & 0x1F;
  var nalRefIdc = (nalUnit[0] & 0x60) >>> 5;

  if (lastOptions) {
    lastOptions.nal_unit_type = nalUnitType;
    lastOptions.nal_ref_idc = nalRefIdc;
  }
  var nalObject = undefined;
  var newOptions = undefined;

  switch (nalUnitType) {
    case 0x01:
      nalObject = _bitStreamsH264.sliceLayerWithoutPartitioning.decode(nalData, lastOptions);
      nalObject.type = 'slice_layer_without_partitioning_rbsp';
      nalObject.nal_ref_idc = nalRefIdc;
      nalObject.size = nalData.length;
      return nalObject;
    case 0x02:
      return {
        type: 'slice_data_partition_a_layer_rbsp',
        size: nalData.length
      };
      break;
    case 0x03:
      return {
        type: 'slice_data_partition_b_layer_rbsp',
        size: nalData.length
      };
    case 0x04:
      return {
        type: 'slice_data_partition_c_layer_rbsp',
        size: nalData.length
      };
    case 0x05:
      newOptions = mergePS(lastOptions, { idrPicFlag: 1 });
      nalObject = _bitStreamsH264.sliceLayerWithoutPartitioning.decode(nalData, newOptions);
      nalObject.type = 'slice_layer_without_partitioning_rbsp_idr';
      nalObject.nal_ref_idc = nalRefIdc;
      nalObject.size = nalData.length;
      return nalObject;
    case 0x06:
      return {
        type: 'sei_rbsp',
        size: nalData.length
      };
    case 0x07:
      lastSPS = _bitStreamsH264.seqParameterSet.decode(nalData);
      lastOptions = mergePS(lastPPS, lastSPS);
      lastSPS.type = 'seq_parameter_set_rbsp';
      lastSPS.size = nalData.length;
      return lastSPS;
    case 0x08:
      lastPPS = _bitStreamsH264.picParameterSet.decode(nalData);
      lastOptions = mergePS(lastPPS, lastSPS);
      lastPPS.type = 'pic_parameter_set_rbsp';
      lastPPS.size = nalData.length;
      return lastPPS;
    case 0x09:
      nalObject = _bitStreamsH264.accessUnitDelimiter.decode(nalData);
      nalObject.type = 'access_unit_delimiter_rbsp';
      nalObject.size = nalData.length;
      return nalObject;
    case 0x0A:
      return {
        type: 'end_of_seq_rbsp',
        size: nalData.length
      };
    case 0x0B:
      return {
        type: 'end_of_stream_rbsp',
        size: nalData.length
      };
    case 0x0C:
      return {
        type: 'filler_data_rbsp',
        size: nalData.length
      };
    case 0x0D:
      return {
        type: 'seq_parameter_set_extension_rbsp',
        size: nalData.length
      };
    case 0x0E:
      return {
        type: 'prefix_nal_unit_rbsp',
        size: nalData.length
      };
    case 0x0F:
      return {
        type: 'subset_seq_parameter_set_rbsp',
        size: nalData.length
      };
    case 0x10:
      return {
        type: 'depth_parameter_set_rbsp',
        size: nalData.length
      };
    case 0x13:
      return {
        type: 'slice_layer_without_partitioning_rbsp_aux',
        size: nalData.length
      };
    case 0x14:
    case 0x15:
      return {
        type: 'slice_layer_extension_rbsp',
        size: nalData.length
      };
    default:
      return {
        type: 'INVALID NAL-UNIT-TYPE - ' + nalUnitType,
        size: nalData.length
      };
  }
};

},{"../../bit-streams/h264":3}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonNalParse = require('./common/nal-parse');

var _commonDataToHexJs = require('./common/data-to-hex.js');

var _commonDataToHexJs2 = _interopRequireDefault(_commonDataToHexJs);

var tagTypes = {
  0x08: 'audio',
  0x09: 'video',
  0x12: 'metadata'
},
    hex = function hex(val) {
  return '0x' + ('00' + val.toString(16)).slice(-2).toUpperCase();
},
    hexStringList = function hexStringList(data) {
  var arr = [],
      i;

  while (data.byteLength > 0) {
    i = 0;
    arr.push(hex(data[i++]));
    data = data.subarray(i);
  }
  return arr.join(' ');
},
    parseAVCTag = function parseAVCTag(tag, obj) {
  var avcPacketTypes = ['AVC Sequence Header', 'AVC NALU', 'AVC End-of-Sequence'],
      compositionTime = tag[1] & parseInt('01111111', 2) << 16 | tag[2] << 8 | tag[3];

  obj = obj || {};

  obj.avcPacketType = avcPacketTypes[tag[0]];
  obj.CompositionTime = tag[1] & parseInt('10000000', 2) ? -compositionTime : compositionTime;

  obj.data = tag.subarray(4);
  if (tag[0] === 0) {
    obj.type = 'video-metadata';
  }

  return obj;
},
    parseVideoTag = function parseVideoTag(tag, obj) {
  var frameTypes = ['Unknown', 'Keyframe (for AVC, a seekable frame)', 'Inter frame (for AVC, a nonseekable frame)', 'Disposable inter frame (H.263 only)', 'Generated keyframe (reserved for server use only)', 'Video info/command frame'],
      codecID = tag[0] & parseInt('00001111', 2);

  obj = obj || {};

  obj.frameType = frameTypes[(tag[0] & parseInt('11110000', 2)) >>> 4];
  obj.codecID = codecID;

  if (codecID === 7) {
    return parseAVCTag(tag.subarray(1), obj);
  }
  return obj;
},
    parseAACTag = function parseAACTag(tag, obj) {
  var packetTypes = ['AAC Sequence Header', 'AAC Raw'];

  obj = obj || {};

  obj.aacPacketType = packetTypes[tag[0]];
  obj.data = tag.subarray(1);

  return obj;
},
    parseAudioTag = function parseAudioTag(tag, obj) {
  var formatTable = ['Linear PCM, platform endian', 'ADPCM', 'MP3', 'Linear PCM, little endian', 'Nellymoser 16-kHz mono', 'Nellymoser 8-kHz mono', 'Nellymoser', 'G.711 A-law logarithmic PCM', 'G.711 mu-law logarithmic PCM', 'reserved', 'AAC', 'Speex', 'MP3 8-Khz', 'Device-specific sound'],
      samplingRateTable = ['5.5-kHz', '11-kHz', '22-kHz', '44-kHz'],
      soundFormat = (tag[0] & parseInt('11110000', 2)) >>> 4;

  obj = obj || {};

  obj.soundFormat = formatTable[soundFormat];
  obj.soundRate = samplingRateTable[(tag[0] & parseInt('00001100', 2)) >>> 2];
  obj.soundSize = (tag[0] & parseInt('00000010', 2)) >>> 1 ? '16-bit' : '8-bit';
  obj.soundType = tag[0] & parseInt('00000001', 2) ? 'Stereo' : 'Mono';

  if (soundFormat === 10) {
    return parseAACTag(tag.subarray(1), obj);
  }
  return obj;
},
    parseGenericTag = function parseGenericTag(tag) {
  return {
    type: tagTypes[tag[0]],
    dataSize: tag[1] << 16 | tag[2] << 8 | tag[3],
    timestamp: tag[7] << 24 | tag[4] << 16 | tag[5] << 8 | tag[6],
    streamID: tag[8] << 16 | tag[9] << 8 | tag[10]
  };
},
    inspectFlvTag = function inspectFlvTag(tag) {
  var header = parseGenericTag(tag);
  switch (tag[0]) {
    case 0x08:
      parseAudioTag(tag.subarray(11), header);
      break;
    case 0x09:
      parseVideoTag(tag.subarray(11), header);
      break;
    case 0x12:
  }
  return header;
},
    inspectFlv = function inspectFlv(bytes) {
  var i = 9,
      // header
  dataSize,
      parsedResults = [],
      tag;

  // traverse the tags
  i += 4; // skip previous tag size
  while (i < bytes.byteLength) {
    dataSize = bytes[i + 1] << 16;
    dataSize |= bytes[i + 2] << 8;
    dataSize |= bytes[i + 3];
    dataSize += 11;

    tag = bytes.subarray(i, i + dataSize);
    parsedResults.push(inspectFlvTag(tag));
    i += dataSize + 4;
  }
  return parsedResults;
};

var domifyFlv = function domifyFlv(flvTags) {
  var container = document.createElement('div');

  parsePESPackets(flvTags, container, 1);

  return container;
};

var parsePESPackets = function parsePESPackets(pesPackets, parent, depth) {
  pesPackets.forEach(function (packet) {
    var packetEl = document.createElement('div');
    domifyBox(parseNals(packet), parent, depth + 1);
  });
};

var parseNals = function parseNals(packet) {
  if (packet.type === 'video') {
    packet.nals = (0, _commonNalParse.nalParseAVCC)(packet.data);
  }
  return packet;
};

var domifyBox = function domifyBox(box, parentNode, depth) {
  var isObject = function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  };
  var attributes = ['size', 'flags', 'type', 'version'];
  var specialProperties = ['boxes', 'nals', 'samples', 'packetCount'];
  var objectProperties = Object.keys(box).filter(function (key) {
    return isObject(box[key]) || Array.isArray(box[key]) && isObject(box[key][0]);
  });
  var propertyExclusions = attributes.concat(specialProperties).concat(objectProperties);
  var subProperties = Object.keys(box).filter(function (key) {
    return propertyExclusions.indexOf(key) === -1;
  });

  var boxNode = document.createElement('mp4-box');
  var propertyNode = document.createElement('mp4-properties');
  var subBoxesNode = document.createElement('mp4-boxes');
  var boxTypeNode = document.createElement('mp4-box-type');

  if (box.type) {
    boxTypeNode.textContent = box.type;

    if (depth > 1) {
      boxTypeNode.classList.add('collapsed');
    }

    boxNode.appendChild(boxTypeNode);
  }

  attributes.forEach(function (key) {
    if (typeof box[key] !== 'undefined') {
      boxNode.setAttribute('data-' + key, box[key]);
    }
  });

  if (subProperties.length) {
    subProperties.forEach(function (key) {
      makeProperty(key, box[key], propertyNode);
    });
    boxNode.appendChild(propertyNode);
  }

  if (box.boxes && box.boxes.length) {
    box.boxes.forEach(function (subBox) {
      return domifyBox(subBox, subBoxesNode, depth + 1);
    });
    boxNode.appendChild(subBoxesNode);
  } else if (objectProperties.length) {
    objectProperties.forEach(function (key) {
      if (Array.isArray(box[key])) {
        domifyBox({
          type: key,
          boxes: box[key]
        }, subBoxesNode, depth + 1);
      } else {
        domifyBox(box[key], subBoxesNode, depth + 1);
      }
    });
    boxNode.appendChild(subBoxesNode);
  }

  parentNode.appendChild(boxNode);
};

var makeProperty = function makeProperty(name, value, parentNode) {
  var nameNode = document.createElement('mp4-name');
  var valueNode = document.createElement('mp4-value');
  var propertyNode = document.createElement('mp4-property');

  nameNode.setAttribute('data-name', name);
  nameNode.textContent = name;

  if (value instanceof Uint8Array || value instanceof Uint32Array) {
    var strValue = (0, _commonDataToHexJs2['default'])(value, '');
    var truncValue = strValue.slice(0, 1029); // 21 rows of 16 bytes

    if (truncValue.length < strValue.length) {
      truncValue += '<' + (value.byteLength - 336) + 'b remaining of ' + value.byteLength + 'b total>';
    }

    valueNode.setAttribute('data-value', truncValue.toUpperCase());
    valueNode.innerHTML = truncValue;
    valueNode.classList.add('pre-like');
  } else if (Array.isArray(value)) {
    var strValue = '[' + value.join(', ') + ']';
    valueNode.setAttribute('data-value', strValue);
    valueNode.textContent = strValue;
  } else {
    valueNode.setAttribute('data-value', value);
    valueNode.textContent = value;
  }

  propertyNode.appendChild(nameNode);
  propertyNode.appendChild(valueNode);

  parentNode.appendChild(propertyNode);
};

exports['default'] = {
  inspect: inspectFlv,
  domify: domifyFlv
};
module.exports = exports['default'];

},{"./common/data-to-hex.js":17,"./common/nal-parse":18}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mp4 = require('./mp4');

var _mp42 = _interopRequireDefault(_mp4);

var _ts = require('./ts');

var _ts2 = _interopRequireDefault(_ts);

var _flv = require('./flv');

var _flv2 = _interopRequireDefault(_flv);

exports['default'] = {
  mp4Inspector: _mp42['default'],
  tsInspector: _ts2['default'],
  flvInspector: _flv2['default']
};
module.exports = exports['default'];

},{"./flv":19,"./mp4":21,"./ts":22}],21:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bitStreamsH264 = require('../bit-streams/h264');

var _commonNalParse = require('./common/nal-parse');

var _commonDataToHexJs = require('./common/data-to-hex.js');

var _commonDataToHexJs2 = _interopRequireDefault(_commonDataToHexJs);

/**
 * Returns the string representation of an ASCII encoded four byte buffer.
 * @param buffer {Uint8Array} a four-byte buffer to translate
 * @return {string} the corresponding string
 */
var parseType = function parseType(buffer) {
  var result = '';
  result += String.fromCharCode(buffer[0]);
  result += String.fromCharCode(buffer[1]);
  result += String.fromCharCode(buffer[2]);
  result += String.fromCharCode(buffer[3]);
  return result;
};

var parseMp4Date = function parseMp4Date(seconds) {
  return new Date(seconds * 1000 - 2082844800000);
};

var parseSampleFlags = function parseSampleFlags(flags) {
  return {
    isLeading: (flags[0] & 0x0c) >>> 2,
    dependsOn: flags[0] & 0x03,
    isDependedOn: (flags[1] & 0xc0) >>> 6,
    hasRedundancy: (flags[1] & 0x30) >>> 4,
    paddingValue: (flags[1] & 0x0e) >>> 1,
    isNonSyncSample: flags[1] & 0x01,
    degradationPriority: flags[2] << 8 | flags[3]
  };
};

var lastSPS = undefined;
var lastPPS = undefined;
var lastOptions = undefined;

// registry of handlers for individual mp4 box types
var parse = {
  // codingname, not a first-class box type. stsd entries share the
  // same format as real boxes so the parsing infrastructure can be
  // shared
  avc1: function avc1(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return {
      dataReferenceIndex: view.getUint16(6),
      width: view.getUint16(24),
      height: view.getUint16(26),
      horizresolution: view.getUint16(28) + view.getUint16(30) / 16,
      vertresolution: view.getUint16(32) + view.getUint16(34) / 16,
      frameCount: view.getUint16(40),
      depth: view.getUint16(74),
      config: inspectMp4(data.subarray(78, data.byteLength))
    };
  },
  avcC: function avcC(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      configurationVersion: data[0],
      avcProfileIndication: data[1],
      profileCompatibility: data[2],
      avcLevelIndication: data[3],
      lengthSizeMinusOne: data[4] & 0x03,
      sps: [],
      pps: []
    },
        numOfSequenceParameterSets = data[5] & 0x1f,
        numOfPictureParameterSets,
        nalSize,
        offset,
        i;

    // iterate past any SPSs
    offset = 6;
    for (i = 0; i < numOfSequenceParameterSets; i++) {
      nalSize = view.getUint16(offset);
      offset += 2;
      var nalData = (0, _bitStreamsH264.discardEmulationPrevention)(new Uint8Array(data.subarray(offset + 1, offset + nalSize)));
      lastSPS = _bitStreamsH264.seqParameterSet.decode(nalData);
      lastOptions = (0, _commonNalParse.mergePS)(lastPPS, lastSPS);
      result.sps.push(lastSPS);
      offset += nalSize;
    }
    // iterate past any PPSs
    numOfPictureParameterSets = data[offset];
    offset++;
    for (i = 0; i < numOfPictureParameterSets; i++) {
      nalSize = view.getUint16(offset);
      offset += 2;
      var nalData = (0, _bitStreamsH264.discardEmulationPrevention)(new Uint8Array(data.subarray(offset + 1, offset + nalSize)));
      lastPPS = _bitStreamsH264.picParameterSet.decode(nalData);
      lastOptions = (0, _commonNalParse.mergePS)(lastPPS, lastSPS);
      result.pps.push(lastPPS);
      offset += nalSize;
    }
    return result;
  },
  btrt: function btrt(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return {
      bufferSizeDB: view.getUint32(0),
      maxBitrate: view.getUint32(4),
      avgBitrate: view.getUint32(8)
    };
  },
  esds: function esds(data) {
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      esId: data[6] << 8 | data[7],
      streamPriority: data[8] & 0x1f,
      decoderConfig: {
        objectProfileIndication: data[11],
        streamType: data[12] >>> 2 & 0x3f,
        bufferSize: data[13] << 16 | data[14] << 8 | data[15],
        maxBitrate: data[16] << 24 | data[17] << 16 | data[18] << 8 | data[19],
        avgBitrate: data[20] << 24 | data[21] << 16 | data[22] << 8 | data[23],
        decoderConfigDescriptor: {
          tag: data[24],
          length: data[25],
          audioObjectType: data[26] >>> 3 & 0x1f,
          samplingFrequencyIndex: (data[26] & 0x07) << 1 | data[27] >>> 7 & 0x01,
          channelConfiguration: data[27] >>> 3 & 0x0f
        }
      }
    };
  },
  ftyp: function ftyp(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      majorBrand: parseType(data.subarray(0, 4)),
      minorVersion: view.getUint32(4),
      compatibleBrands: []
    },
        i = 8;
    while (i < data.byteLength) {
      result.compatibleBrands.push(parseType(data.subarray(i, i + 4)));
      i += 4;
    }
    return result;
  },
  dinf: function dinf(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  dref: function dref(data) {
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      dataReferences: inspectMp4(data.subarray(8))
    };
  },
  hdlr: function hdlr(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      version: view.getUint8(0),
      flags: new Uint8Array(data.subarray(1, 4)),
      handlerType: parseType(data.subarray(8, 12)),
      name: ''
    },
        i = 8;

    // parse out the name field
    for (i = 24; i < data.byteLength; i++) {
      if (data[i] === 0x00) {
        // the name field is null-terminated
        i++;
        break;
      }
      result.name += String.fromCharCode(data[i]);
    }
    // decode UTF-8 to javascript's internal representation
    // see http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
    result.name = decodeURIComponent(global.escape(result.name));

    return result;
  },
  mdat: function mdat(data) {
    return {
      byteLength: data.byteLength,
      nals: (0, _commonNalParse.nalParseAVCC)(data)
    };
  },
  mdhd: function mdhd(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        i = 4,
        language,
        result = {
      version: view.getUint8(0),
      flags: new Uint8Array(data.subarray(1, 4)),
      language: ''
    };
    if (result.version === 1) {
      i += 4;
      result.creationTime = parseMp4Date(view.getUint32(i)); // truncating top 4 bytes
      i += 8;
      result.modificationTime = parseMp4Date(view.getUint32(i)); // truncating top 4 bytes
      i += 4;
      result.timescale = view.getUint32(i);
      i += 8;
      result.duration = view.getUint32(i); // truncating top 4 bytes
    } else {
        result.creationTime = parseMp4Date(view.getUint32(i));
        i += 4;
        result.modificationTime = parseMp4Date(view.getUint32(i));
        i += 4;
        result.timescale = view.getUint32(i);
        i += 4;
        result.duration = view.getUint32(i);
      }
    i += 4;
    // language is stored as an ISO-639-2/T code in an array of three 5-bit fields
    // each field is the packed difference between its ASCII value and 0x60
    language = view.getUint16(i);
    result.language += String.fromCharCode((language >> 10) + 0x60);
    result.language += String.fromCharCode(((language & 0x03c0) >> 5) + 0x60);
    result.language += String.fromCharCode((language & 0x1f) + 0x60);

    return result;
  },
  mdia: function mdia(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  mfhd: function mfhd(data) {
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      sequenceNumber: data[4] << 24 | data[5] << 16 | data[6] << 8 | data[7]
    };
  },
  minf: function minf(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  // codingname, not a first-class box type. stsd entries share the
  // same format as real boxes so the parsing infrastructure can be
  // shared
  mp4a: function mp4a(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      // 6 bytes reserved
      dataReferenceIndex: view.getUint16(6),
      // 4 + 4 bytes reserved
      channelcount: view.getUint16(16),
      samplesize: view.getUint16(18),
      // 2 bytes pre_defined
      // 2 bytes reserved
      samplerate: view.getUint16(24) + view.getUint16(26) / 65536
    };

    // if there are more bytes to process, assume this is an ISO/IEC
    // 14496-14 MP4AudioSampleEntry and parse the ESDBox
    if (data.byteLength > 28) {
      result.streamDescriptor = inspectMp4(data.subarray(28))[0];
    }
    return result;
  },
  moof: function moof(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  moov: function moov(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  mvex: function mvex(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  mvhd: function mvhd(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        i = 4,
        result = {
      version: view.getUint8(0),
      flags: new Uint8Array(data.subarray(1, 4))
    };

    if (result.version === 1) {
      i += 4;
      result.creationTime = parseMp4Date(view.getUint32(i)); // truncating top 4 bytes
      i += 8;
      result.modificationTime = parseMp4Date(view.getUint32(i)); // truncating top 4 bytes
      i += 4;
      result.timescale = view.getUint32(i);
      i += 8;
      result.duration = view.getUint32(i); // truncating top 4 bytes
    } else {
        result.creationTime = parseMp4Date(view.getUint32(i));
        i += 4;
        result.modificationTime = parseMp4Date(view.getUint32(i));
        i += 4;
        result.timescale = view.getUint32(i);
        i += 4;
        result.duration = view.getUint32(i);
      }
    i += 4;

    // convert fixed-point, base 16 back to a number
    result.rate = view.getUint16(i) + view.getUint16(i + 2) / 16;
    i += 4;
    result.volume = view.getUint8(i) + view.getUint8(i + 1) / 8;
    i += 2;
    i += 2;
    i += 2 * 4;
    result.matrix = new Uint32Array(data.subarray(i, i + 9 * 4));
    i += 9 * 4;
    i += 6 * 4;
    result.nextTrackId = view.getUint32(i);
    return result;
  },
  pdin: function pdin(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return {
      version: view.getUint8(0),
      flags: new Uint8Array(data.subarray(1, 4)),
      rate: view.getUint32(4),
      initialDelay: view.getUint32(8)
    };
  },
  sdtp: function sdtp(data) {
    var result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      samples: []
    },
        i;

    for (i = 4; i < data.byteLength; i++) {
      result.samples.push({
        dependsOn: (data[i] & 0x30) >> 4,
        isDependedOn: (data[i] & 0x0c) >> 2,
        hasRedundancy: data[i] & 0x03
      });
    }
    return result;
  },
  sidx: function sidx(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      references: [],
      referenceId: view.getUint32(4),
      timescale: view.getUint32(8),
      earliestPresentationTime: view.getUint32(12),
      firstOffset: view.getUint32(16)
    },
        referenceCount = view.getUint16(22),
        i;

    for (i = 24; referenceCount; i += 12, referenceCount--) {
      result.references.push({
        referenceType: (data[i] & 0x80) >>> 7,
        referencedSize: view.getUint32(i) & 0x7FFFFFFF,
        subsegmentDuration: view.getUint32(i + 4),
        startsWithSap: !!(data[i + 8] & 0x80),
        sapType: (data[i + 8] & 0x70) >>> 4,
        sapDeltaTime: view.getUint32(i + 8) & 0x0FFFFFFF
      });
    }

    return result;
  },
  smhd: function smhd(data) {
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      balance: data[4] + data[5] / 256
    };
  },
  stbl: function stbl(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  stco: function stco(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      chunkOffsets: []
    },
        entryCount = view.getUint32(4),
        i;
    for (i = 8; entryCount; i += 4, entryCount--) {
      result.chunkOffsets.push(view.getUint32(i));
    }
    return result;
  },
  stsc: function stsc(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        entryCount = view.getUint32(4),
        result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      sampleToChunks: []
    },
        i;
    for (i = 8; entryCount; i += 12, entryCount--) {
      result.sampleToChunks.push({
        firstChunk: view.getUint32(i),
        samplesPerChunk: view.getUint32(i + 4),
        sampleDescriptionIndex: view.getUint32(i + 8)
      });
    }
    return result;
  },
  stsd: function stsd(data) {
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      sampleDescriptions: inspectMp4(data.subarray(8))
    };
  },
  stsz: function stsz(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      sampleSize: view.getUint32(4),
      entries: []
    },
        i;
    for (i = 12; i < data.byteLength; i += 4) {
      result.entries.push(view.getUint32(i));
    }
    return result;
  },
  stts: function stts(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      timeToSamples: []
    },
        entryCount = view.getUint32(4),
        i;

    for (i = 8; entryCount; i += 8, entryCount--) {
      result.timeToSamples.push({
        sampleCount: view.getUint32(i),
        sampleDelta: view.getUint32(i + 4)
      });
    }
    return result;
  },
  styp: function styp(data) {
    return parse.ftyp(data);
  },
  tfdt: function tfdt(data) {
    var result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      baseMediaDecodeTime: data[4] << 24 | data[5] << 16 | data[6] << 8 | data[7]
    };
    if (result.version === 1) {
      result.baseMediaDecodeTime *= Math.pow(2, 32);
      result.baseMediaDecodeTime += data[8] << 24 | data[9] << 16 | data[10] << 8 | data[11];
    }
    return result;
  },
  tfhd: function tfhd(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      trackId: view.getUint32(4)
    },
        baseDataOffsetPresent = result.flags[2] & 0x01,
        sampleDescriptionIndexPresent = result.flags[2] & 0x02,
        defaultSampleDurationPresent = result.flags[2] & 0x08,
        defaultSampleSizePresent = result.flags[2] & 0x10,
        defaultSampleFlagsPresent = result.flags[2] & 0x20,
        i;

    i = 8;
    if (baseDataOffsetPresent) {
      i += 4; // truncate top 4 bytes
      result.baseDataOffset = view.getUint32(12);
      i += 4;
    }
    if (sampleDescriptionIndexPresent) {
      result.sampleDescriptionIndex = view.getUint32(i);
      i += 4;
    }
    if (defaultSampleDurationPresent) {
      result.defaultSampleDuration = view.getUint32(i);
      i += 4;
    }
    if (defaultSampleSizePresent) {
      result.defaultSampleSize = view.getUint32(i);
      i += 4;
    }
    if (defaultSampleFlagsPresent) {
      result.defaultSampleFlags = view.getUint32(i);
    }
    return result;
  },
  tkhd: function tkhd(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        i = 4,
        result = {
      version: view.getUint8(0),
      flags: new Uint8Array(data.subarray(1, 4))
    };
    if (result.version === 1) {
      i += 4;
      result.creationTime = parseMp4Date(view.getUint32(i)); // truncating top 4 bytes
      i += 8;
      result.modificationTime = parseMp4Date(view.getUint32(i)); // truncating top 4 bytes
      i += 4;
      result.trackId = view.getUint32(i);
      i += 4;
      i += 8;
      result.duration = view.getUint32(i); // truncating top 4 bytes
    } else {
        result.creationTime = parseMp4Date(view.getUint32(i));
        i += 4;
        result.modificationTime = parseMp4Date(view.getUint32(i));
        i += 4;
        result.trackId = view.getUint32(i);
        i += 4;
        i += 4;
        result.duration = view.getUint32(i);
      }
    i += 4;
    i += 2 * 4;
    result.layer = view.getUint16(i);
    i += 2;
    result.alternateGroup = view.getUint16(i);
    i += 2;
    // convert fixed-point, base 16 back to a number
    result.volume = view.getUint8(i) + view.getUint8(i + 1) / 8;
    i += 2;
    i += 2;
    result.matrix = new Uint32Array(data.subarray(i, i + 9 * 4));
    i += 9 * 4;
    result.width = view.getUint16(i) + view.getUint16(i + 2) / 16;
    i += 4;
    result.height = view.getUint16(i) + view.getUint16(i + 2) / 16;
    return result;
  },
  traf: function traf(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  trak: function trak(data) {
    return {
      boxes: inspectMp4(data)
    };
  },
  trex: function trex(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      trackId: view.getUint32(4),
      defaultSampleDescriptionIndex: view.getUint32(8),
      defaultSampleDuration: view.getUint32(12),
      defaultSampleSize: view.getUint32(16),
      sampleDependsOn: data[20] & 0x03,
      sampleIsDependedOn: (data[21] & 0xc0) >> 6,
      sampleHasRedundancy: (data[21] & 0x30) >> 4,
      samplePaddingValue: (data[21] & 0x0e) >> 1,
      sampleIsDifferenceSample: !!(data[21] & 0x01),
      sampleDegradationPriority: view.getUint16(22)
    };
  },
  trun: function trun(data) {
    var result = {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      samples: []
    },
        view = new DataView(data.buffer, data.byteOffset, data.byteLength),
        dataOffsetPresent = result.flags[2] & 0x01,
        firstSampleFlagsPresent = result.flags[2] & 0x04,
        sampleDurationPresent = result.flags[1] & 0x01,
        sampleSizePresent = result.flags[1] & 0x02,
        sampleFlagsPresent = result.flags[1] & 0x04,
        sampleCompositionTimeOffsetPresent = result.flags[1] & 0x08,
        sampleCount = view.getUint32(4),
        offset = 8,
        sample;

    if (dataOffsetPresent) {
      result.dataOffset = view.getUint32(offset);
      offset += 4;
    }

    if (firstSampleFlagsPresent && sampleCount) {
      sample = {
        flags: parseSampleFlags(data.subarray(offset, offset + 4))
      };
      offset += 4;
      if (sampleDurationPresent) {
        sample.duration = view.getUint32(offset);
        offset += 4;
      }
      if (sampleSizePresent) {
        sample.size = view.getUint32(offset);
        offset += 4;
      }
      if (sampleCompositionTimeOffsetPresent) {
        sample.compositionTimeOffset = view.getUint32(offset);
        offset += 4;
      }
      result.samples.push(sample);
      sampleCount--;
    }

    while (sampleCount--) {
      sample = {};
      if (sampleDurationPresent) {
        sample.duration = view.getUint32(offset);
        offset += 4;
      }
      if (sampleSizePresent) {
        sample.size = view.getUint32(offset);
        offset += 4;
      }
      if (sampleFlagsPresent) {
        sample.flags = parseSampleFlags(data.subarray(offset, offset + 4));
        offset += 4;
      }
      if (sampleCompositionTimeOffsetPresent) {
        sample.compositionTimeOffset = view.getUint32(offset);
        offset += 4;
      }
      result.samples.push(sample);
    }
    return result;
  },
  'url ': function url(data) {
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4))
    };
  },
  vmhd: function vmhd(data) {
    var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return {
      version: data[0],
      flags: new Uint8Array(data.subarray(1, 4)),
      graphicsmode: view.getUint16(4),
      opcolor: new Uint16Array([view.getUint16(6), view.getUint16(8), view.getUint16(10)])
    };
  }
};

/**
 * Return a javascript array of box objects parsed from an ISO base
 * media file.
 * @param data {Uint8Array} the binary data of the media to be inspected
 * @return {array} a javascript array of potentially nested box objects
 */
var inspectMp4 = function inspectMp4(data) {
  var i = 0,
      result = [],
      view,
      size,
      type,
      end,
      box,
      seenMOOV = false,
      pendingMDAT = null;

  // Convert data from Uint8Array to ArrayBuffer, to follow Dataview API
  var ab = new ArrayBuffer(data.length);
  var v = new Uint8Array(ab);
  for (var z = 0; z < data.length; ++z) {
    v[z] = data[z];
  }
  view = new DataView(ab);

  while (i < data.byteLength) {
    // parse box data
    size = view.getUint32(i);
    type = parseType(data.subarray(i + 4, i + 8));
    end = size > 1 ? i + size : data.byteLength;

    if (type === 'moov') {
      seenMOOV = true;
    }

    if (type === 'mdat' && !seenMOOV) {
      pendingMDAT = data.subarray(i + 8, end);
    } else {
      // parse type-specific data
      box = (parse[type] || function (data) {
        return {
          data: data
        };
      })(data.subarray(i + 8, end));
      box.size = size;
      box.type = type;
      // store this box and move to the next
      result.push(box);
    }

    if (pendingMDAT && seenMOOV) {
      box = parse['mdat'](pendingMDAT);
      box.size = pendingMDAT.byteLength;
      box.type = 'mdat';
      // store this box and move to the next
      result.push(box);
      pendingMDAT = null;
    }

    i = end;
  }
  return result;
};

/**
 * Returns a textual representation of the javascript represtentation
 * of an MP4 file. You can use it as an alternative to
 * JSON.stringify() to compare inspected MP4s.
 * @param inspectedMp4 {array} the parsed array of boxes in an MP4
 * file
 * @param depth {number} (optional) the number of ancestor boxes of
 * the elements of inspectedMp4. Assumed to be zero if unspecified.
 * @return {string} a text representation of the parsed MP4
 */
var textifyMp4 = function textifyMp4(inspectedMp4, depth) {
  var indent;
  depth = depth || 0;
  indent = new Array(depth * 2 + 1).join(' ');

  // iterate over all the boxes
  return inspectedMp4.map(function (box, index) {

    // list the box type first at the current indentation level
    return indent + box.type + '\n' +

    // the type is already included and handle child boxes separately
    Object.keys(box).filter(function (key) {
      return key !== 'type' && key !== 'boxes';

      // output all the box properties
    }).map(function (key) {
      var prefix = indent + '  ' + key + ': ',
          value = box[key];

      // print out raw bytes as hexademical
      if (value instanceof Uint8Array || value instanceof Uint32Array) {
        return prefix + (0, _commonDataToHexJs2['default'])(value, indent);
      }

      // stringify generic objects
      return prefix + JSON.stringify(value, null, 2).split('\n').map(function (line, index) {
        if (index === 0) {
          return line;
        }
        return indent + '  ' + line;
      }).join('\n');
    }).join('\n') + (

    // recursively textify the child boxes
    box.boxes ? '\n' + textifyMp4(box.boxes, depth + 1) : '');
  }).join('\n');
};

var domifyMp4 = function domifyMp4(inspectedMp4) {
  var topLevelObject = {
    type: 'mp4',
    boxes: inspectedMp4,
    size: inspectedMp4.reduce(function (sum, box) {
      return sum + box.size;
    }, 0)
  };

  var container = document.createElement('div');

  domifyBox(topLevelObject, container, 1);

  return container;
};

/*
<boxType size="100" flags>
  <properties>
    <name></name><value></value>
    <name></name><value></value>
  </properties>
  <boxes>
  </boxes>
</boxType>
*/

var domifyBox = function domifyBox(box, parentNode, depth) {
  var isObject = function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  };
  var attributes = ['size', 'flags', 'type', 'version'];
  var specialProperties = ['boxes', 'nals', 'samples'];
  var objectProperties = Object.keys(box).filter(function (key) {
    return isObject(box[key]) || Array.isArray(box[key]) && isObject(box[key][0]);
  });
  var propertyExclusions = attributes.concat(specialProperties).concat(objectProperties);
  var subProperties = Object.keys(box).filter(function (key) {
    return propertyExclusions.indexOf(key) === -1;
  });

  var boxNode = document.createElement('mp4-box');
  var propertyNode = document.createElement('mp4-properties');
  var subBoxesNode = document.createElement('mp4-boxes');
  var boxTypeNode = document.createElement('mp4-box-type');

  if (box.type) {
    boxTypeNode.textContent = box.type;

    if (depth > 1) {
      boxTypeNode.classList.add('collapsed');
    }

    boxNode.appendChild(boxTypeNode);
  }

  attributes.forEach(function (key) {
    if (typeof box[key] !== 'undefined') {
      boxNode.setAttribute('data-' + key, box[key]);
    }
  });

  if (subProperties.length) {
    subProperties.forEach(function (key) {
      makeProperty(key, box[key], propertyNode);
    });
    boxNode.appendChild(propertyNode);
  }

  if (box.boxes && box.boxes.length) {
    box.boxes.forEach(function (subBox) {
      return domifyBox(subBox, subBoxesNode, depth + 1);
    });
    boxNode.appendChild(subBoxesNode);
  } else if (objectProperties.length) {
    objectProperties.forEach(function (key) {
      if (Array.isArray(box[key])) {
        domifyBox({
          type: key,
          boxes: box[key]
        }, subBoxesNode, depth + 1);
      } else {
        domifyBox(box[key], subBoxesNode, depth + 1);
      }
    });
    boxNode.appendChild(subBoxesNode);
  }

  parentNode.appendChild(boxNode);
};

var makeProperty = function makeProperty(name, value, parentNode) {
  var nameNode = document.createElement('mp4-name');
  var valueNode = document.createElement('mp4-value');
  var propertyNode = document.createElement('mp4-property');

  nameNode.setAttribute('data-name', name);
  nameNode.textContent = name;

  if (value instanceof Uint8Array || value instanceof Uint32Array) {
    var strValue = (0, _commonDataToHexJs2['default'])(value, '');
    var truncValue = strValue.slice(0, 1029); // 21 rows of 16 bytes

    if (truncValue.length < strValue.length) {
      truncValue += '<' + (value.byteLength - 336) + 'b remaining of ' + value.byteLength + 'b total>';
    }

    valueNode.setAttribute('data-value', truncValue.toUpperCase());
    valueNode.innerHTML = truncValue;
    valueNode.classList.add('pre-like');
  } else if (Array.isArray(value)) {
    var strValue = '[' + value.join(', ') + ']';
    valueNode.setAttribute('data-value', strValue);
    valueNode.textContent = strValue;
  } else {
    valueNode.setAttribute('data-value', value);
    valueNode.textContent = value;
  }

  propertyNode.appendChild(nameNode);
  propertyNode.appendChild(valueNode);

  parentNode.appendChild(propertyNode);
};

exports['default'] = {
  inspect: inspectMp4,
  textify: textifyMp4,
  domify: domifyMp4
};
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../bit-streams/h264":3,"./common/data-to-hex.js":17,"./common/nal-parse":18}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonNalParse = require('./common/nal-parse');

var _commonDataToHexJs = require('./common/data-to-hex.js');

var _commonDataToHexJs2 = _interopRequireDefault(_commonDataToHexJs);

// constants
var MP2T_PACKET_LENGTH = 188; // in bytes
var SYNC_BYTE = 0x47;
var STREAM_TYPES = {
  h264: 0x1b,
  adts: 0x0f,
  metadata: 0x15
};

/**
 * Splits an incoming stream of binary data into MPEG-2 Transport
 * Stream packets.
 */
var parseTransportStream = function parseTransportStream(bytes) {
  var startIndex = 0,
      endIndex = MP2T_PACKET_LENGTH,
      lastSync = -1,
      packets = [];

  // While we have enough data for a packet
  while (endIndex < bytes.byteLength) {
    // Look for a pair of start and end sync bytes in the data..
    if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
      if (lastSync !== -1) {
        packets.push({
          type: 'unknown-bytes',
          data: bytes.subarray(lastSync, startIndex)
        });
        lastSync = -1;
      }

      // We found a packet so emit it and jump one whole packet forward in
      // the stream
      packets.push({
        type: 'transportstream-packet',
        data: bytes.subarray(startIndex, endIndex)
      });
      startIndex += MP2T_PACKET_LENGTH;
      endIndex += MP2T_PACKET_LENGTH;
      continue;
    }
    // If we get here, we have somehow become de-synchronized and we need to step
    // forward one byte at a time until we find a pair of sync bytes that denote
    // a packet
    lastSync = startIndex;
    startIndex++;
    endIndex++;
  }

  if (startIndex + MP2T_PACKET_LENGTH === bytes.byteLength) {
    // We found a final packet so emit it and jump one whole packet forward in
    // the stream
    packets.push({
      type: 'transportstream-packet',
      data: bytes.subarray(startIndex, endIndex)
    });
    startIndex += MP2T_PACKET_LENGTH;
    endIndex += MP2T_PACKET_LENGTH;
  }

  // If there was some data left over at the end of the segment that couldn't
  // possibly be a whole packet, emit it for completeness
  if (startIndex < bytes.byteLength) {
    packets.push({
      type: 'unknown-bytes',
      data: bytes.subarray(startIndex)
    });
  }

  return parseTransportStreamPackets(packets);
};

/**
 * Accepts an MP2T TransportPacketStream and emits data events with parsed
 * forms of the individual transport stream packets.
 */
var parseTransportStreamPackets = function parseTransportStreamPackets(packets) {
  var packetsPendingPmt = [];
  var packetsPendingPmtPid = [];
  var programMapTable = null;
  var pmtPid = null;

  var processPmtOrPes = function processPmtOrPes(packet) {
    if (packet.pid === pmtPid) {
      packet.content.type = 'pmt';
      parsePsi(packet);
    } else if (programMapTable === null) {
      // When we have not seen a PMT yet, defer further processing of
      // PES packets until one has been parsed
      packetsPendingPmt.push(packet);
    } else {
      processPes(packet);
    }
  };

  var processPes = function processPes(packet) {
    packet.content.streamType = programMapTable[packet.pid];
    packet.content.type = 'pes';
  };

  var parsePsi = function parsePsi(packet) {
    var offset = 0;
    var psi = packet.content;
    var payload = psi.data;

    // PSI packets may be split into multiple sections and those
    // sections may be split into multiple packets. If a PSI
    // section starts in this packet, the payload_unit_start_indicator
    // will be true and the first byte of the payload will indicate
    // the offset from the current position to the start of the
    // section.
    if (packet.payloadUnitStartIndicator) {
      offset += payload[0] + 1;
    }

    psi.data = payload.subarray(offset);

    if (psi.type === 'pat') {
      parsePat(packet);
    } else {
      parsePmt(packet);
    }
  };

  var parsePat = function parsePat(packet) {
    var pat = packet.content;
    var payload = pat.data;

    pat.sectionNumber = payload[7]; // eslint-disable-line camelcase
    pat.lastSectionNumber = payload[8]; // eslint-disable-line camelcase

    // skip the PSI header and parse the first PMT entry
    pmtPid = (payload[10] & 0x1F) << 8 | payload[11];
    pat.pmtPid = pmtPid;

    // if there are any packets waiting for a PMT PID to be found, process them now
    while (packetsPendingPmtPid.length) {
      processPmtOrPes(packetsPendingPmtPid.shift());
    }
  };

  /**
   * Parse out the relevant fields of a Program Map Table (PMT).
   * @param payload {Uint8Array} the PMT-specific portion of an MP2T
   * packet. The first byte in this array should be the table_id
   * field.
   * @param pmt {object} the object that should be decorated with
   * fields parsed from the PMT.
   */
  var parsePmt = function parsePmt(packet) {
    var pmt = packet.content;
    var payload = pmt.data;

    var sectionLength, tableEnd, programInfoLength, offset;

    // PMTs can be sent ahead of the time when they should actually
    // take effect. We don't believe this should ever be the case
    // for HLS but we'll ignore "forward" PMT declarations if we see
    // them. Future PMT declarations have the current_next_indicator
    // set to zero.
    if (!(payload[5] & 0x01)) {
      return;
    }

    // overwrite any existing program map table
    programMapTable = {};

    // the mapping table ends at the end of the current section
    sectionLength = (payload[1] & 0x0f) << 8 | payload[2];
    tableEnd = 3 + sectionLength - 4;

    // to determine where the table is, we have to figure out how
    // long the program info descriptors are
    programInfoLength = (payload[10] & 0x0f) << 8 | payload[11];

    // advance the offset to the first entry in the mapping table
    offset = 12 + programInfoLength;
    while (offset < tableEnd) {
      // add an entry that maps the elementary_pid to the stream_type
      programMapTable[(payload[offset + 1] & 0x1F) << 8 | payload[offset + 2]] = payload[offset];

      // move to the next table entry
      // skip past the elementary stream descriptors, if present
      offset += ((payload[offset + 3] & 0x0F) << 8 | payload[offset + 4]) + 5;
    }

    // record the map on the packet as well
    pmt.programMapTable = programMapTable;

    // if there are any packets waiting for a PMT to be found, process them now
    while (packetsPendingPmt.length) {
      processPes(packetsPendingPmt.shift());
    }
  };

  /**
   * Deliver a new MP2T packet to the stream.
   */
  var parsePacket = function parsePacket(packet) {
    var offset = 4;
    var payload = packet.data;
    var content = {};

    packet.payloadUnitStartIndicator = !!(payload[1] & 0x40);

    // pid is a 13-bit field starting at the last bit of packet[1]
    packet.pid = payload[1] & 0x1f;
    packet.pid <<= 8;
    packet.pid |= payload[2];
    packet.content = content;

    // if an adaption field is present, its length is specified by the
    // fifth byte of the TS packet header. The adaptation field is
    // used to add stuffing to PES packets that don't fill a complete
    // TS packet, and to specify some forms of timing and control data
    // that we do not currently use.
    if ((payload[3] & 0x30) >>> 4 > 0x01) {
      offset += payload[offset] + 1;
    }

    content.data = payload.subarray(offset);

    // parse the rest of the packet based on the type
    if (packet.pid === 0) {
      content.type = 'pat';
      parsePsi(packet);
      return packet;
    }

    if (pmtPid === null) {
      packetsPendingPmtPid.push(packet);
      return packet;
    }

    return processPmtOrPes(packet);
  };

  packets.filter(function (packet) {
    return packet.type === 'transportstream-packet';
  }).forEach(function (packet) {
    if (packet.type === 'transportstream-packet') {
      parsePacket(packet);
    } else {
      packet.content = {};
    }
  });

  return packets;
};

/**
 * Reconsistutes program elementary stream (PES) packets from parsed
 * transport stream packets. That is, if you pipe an
 * mp2t.TransportParseStream into a mp2t.ElementaryStream, the output
 * events will be events which capture the bytes for individual PES
 * packets plus relevant metadata that has been extracted from the
 * container.
 */
var parsePesPackets = function parsePesPackets(packets) {
  var completeEs = [],

  // PES packet fragments
  video = {
    data: [],
    tsPacketIndices: [],
    size: 0
  },
      audio = {
    data: [],
    tsPacketIndices: [],
    size: 0
  },
      timedMetadata = {
    data: [],
    tsPacketIndices: [],
    size: 0
  },
      parsePes = function parsePes(payload, pes) {
    var ptsDtsFlags;

    // find out if this packets starts a new keyframe
    pes.dataAlignmentIndicator = (payload[6] & 0x04) !== 0;
    // PES packets may be annotated with a PTS value, or a PTS value
    // and a DTS value. Determine what combination of values is
    // available to work with.
    ptsDtsFlags = payload[7];

    // PTS and DTS are normally stored as a 33-bit number.  Javascript
    // performs all bitwise operations on 32-bit integers but javascript
    // supports a much greater range (52-bits) of integer using standard
    // mathematical operations.
    // We construct a 31-bit value using bitwise operators over the 31
    // most significant bits and then multiply by 4 (equal to a left-shift
    // of 2) before we add the final 2 least significant bits of the
    // timestamp (equal to an OR.)
    if (ptsDtsFlags & 0xC0) {
      // the PTS and DTS are not written out directly. For information
      // on how they are encoded, see
      // http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
      pes.pts = (payload[9] & 0x0E) << 27 | (payload[10] & 0xFF) << 20 | (payload[11] & 0xFE) << 12 | (payload[12] & 0xFF) << 5 | (payload[13] & 0xFE) >>> 3;
      pes.pts *= 4; // Left shift by 2
      pes.pts += (payload[13] & 0x06) >>> 1; // OR by the two LSBs
      pes.dts = pes.pts;
      if (ptsDtsFlags & 0x40) {
        pes.dts = (payload[14] & 0x0E) << 27 | (payload[15] & 0xFF) << 20 | (payload[16] & 0xFE) << 12 | (payload[17] & 0xFF) << 5 | (payload[18] & 0xFE) >>> 3;
        pes.dts *= 4; // Left shift by 2
        pes.dts += (payload[18] & 0x06) >>> 1; // OR by the two LSBs
      }
    }

    // the data section starts immediately after the PES header.
    // pes_header_data_length specifies the number of header bytes
    // that follow the last byte of the field.
    pes.data = payload.subarray(9 + payload[8]);
  },
      flushStream = function flushStream(stream, type) {
    var packetData = new Uint8Array(stream.size),
        event = {
      type: type
    },
        i = 0,
        fragment;

    // do nothing if there is no buffered data
    if (!stream.data.length) {
      return;
    }
    event.pid = stream.pid;
    event.packetCount = stream.data.length;
    event.tsPacketIndices = stream.tsPacketIndices;
    // reassemble the packet
    while (stream.data.length) {
      fragment = stream.data.shift();

      packetData.set(fragment.data, i);
      i += fragment.data.byteLength;
    }

    // parse assembled packet's PES header
    parsePes(packetData, event);

    stream.size = 0;
    stream.tsPacketIndices = [];

    completeEs.push(event);
  };

  var packetTypes = {
    pat: function pat(packet, packetIndex) {
      var pat = packet.content;
      completeEs.push({
        pid: packet.pid,
        type: 'pat',
        packetCount: 1,
        sectionNumber: pat.sectionNumber,
        lastSectionNumber: pat.lastSectionNumber,
        tsPacketIndices: [packetIndex],
        pmtPid: pat.pmtPid,
        data: pat.data
      });
    },
    pes: function pes(packet, packetIndex) {
      var stream = undefined;
      var streamType = undefined;
      var pes = packet.content;

      switch (pes.streamType) {
        case STREAM_TYPES.h264:
          stream = video;
          streamType = 'video';
          break;
        case STREAM_TYPES.adts:
          stream = audio;
          streamType = 'audio';
          break;
        case STREAM_TYPES.metadata:
          stream = timedMetadata;
          streamType = 'timed-metadata';
          break;
        default:
          // ignore unknown stream types
          return;
      }

      // if a new packet is starting, we can flush the completed
      // packet
      if (packet.payloadUnitStartIndicator) {
        flushStream(stream, streamType);
      }

      stream.pid = packet.pid;
      stream.tsPacketIndices.push(packetIndex);
      // buffer this fragment until we are sure we've received the
      // complete payload
      stream.data.push(pes);
      stream.size += pes.data.byteLength;
    },
    pmt: function pmt(packet, packetIndex) {
      var pmt = packet.content;
      var programMapTable = pmt.programMapTable;
      var event = {
        pid: packet.pid,
        type: 'pmt',
        tracks: [],
        tsPacketIndices: [packetIndex],
        packetCount: 1,
        data: pmt.data
      };
      var k = undefined;
      var track = undefined;

      // translate streams to tracks
      for (k in programMapTable) {
        if (programMapTable.hasOwnProperty(k)) {
          track = {};

          track.id = +k;
          if (programMapTable[k] === STREAM_TYPES.h264) {
            track.codec = 'avc';
            track.type = 'video';
          } else if (programMapTable[k] === STREAM_TYPES.adts) {
            track.codec = 'adts';
            track.type = 'audio';
          }
          event.tracks.push(track);
        }
      }
      completeEs.push(event);
    }
  };

  var parsePacket = function parsePacket(packet, packetIndex) {
    switch (packet.content.type) {
      case 'pat':
      case 'pmt':
      case 'pes':
        packetTypes[packet.content.type](packet, packetIndex);
        break;
      default:
        break;
    }
  };

  packets.forEach(function (packet, packetIndex) {
    parsePacket(packet, packetIndex);
  });

  flushStream(video, 'video');
  flushStream(audio, 'audio');
  flushStream(timedMetadata, 'timed-metadata');

  return completeEs;
};

var inspectTs = function inspectTs(data) {
  var object = {};
  var tsPackets = parseTransportStream(data);
  var pesPackets = parsePesPackets(tsPackets);

  object.tsMap = tsPackets;
  object.esMap = pesPackets;

  return object;
};

var domifyTs = function domifyTs(object) {
  var tsPackets = object.tsMap;
  var pesPackets = object.esMap;
  var container = document.createElement('div');

  parsePESPackets(pesPackets, container, 1);

  return container;
};

var parsePESPackets = function parsePESPackets(pesPackets, parent, depth) {
  pesPackets.forEach(function (packet) {
    var packetEl = document.createElement('div');
    domifyBox(parseNals(packet), parent, depth + 1);
  });
};

var parseNals = function parseNals(packet) {
  if (packet.type === 'video') {
    packet.nals = (0, _commonNalParse.nalParseAnnexB)(packet.data);
  }
  return packet;
};

var domifyBox = function domifyBox(box, parentNode, depth) {
  var isObject = function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  };
  var attributes = ['size', 'flags', 'type', 'version'];
  var specialProperties = ['boxes', 'nals', 'samples', 'packetCount'];
  var objectProperties = Object.keys(box).filter(function (key) {
    return isObject(box[key]) || Array.isArray(box[key]) && isObject(box[key][0]);
  });
  var propertyExclusions = attributes.concat(specialProperties).concat(objectProperties);
  var subProperties = Object.keys(box).filter(function (key) {
    return propertyExclusions.indexOf(key) === -1;
  });

  var boxNode = document.createElement('mp4-box');
  var propertyNode = document.createElement('mp4-properties');
  var subBoxesNode = document.createElement('mp4-boxes');
  var boxTypeNode = document.createElement('mp4-box-type');

  if (box.type) {
    boxTypeNode.textContent = box.type;

    if (depth > 1) {
      boxTypeNode.classList.add('collapsed');
    }

    boxNode.appendChild(boxTypeNode);
  }

  attributes.forEach(function (key) {
    if (typeof box[key] !== 'undefined') {
      boxNode.setAttribute('data-' + key, box[key]);
    }
  });

  if (subProperties.length) {
    subProperties.forEach(function (key) {
      makeProperty(key, box[key], propertyNode);
    });
    boxNode.appendChild(propertyNode);
  }

  if (box.boxes && box.boxes.length) {
    box.boxes.forEach(function (subBox) {
      return domifyBox(subBox, subBoxesNode, depth + 1);
    });
    boxNode.appendChild(subBoxesNode);
  } else if (objectProperties.length) {
    objectProperties.forEach(function (key) {
      if (Array.isArray(box[key])) {
        domifyBox({
          type: key,
          boxes: box[key]
        }, subBoxesNode, depth + 1);
      } else {
        domifyBox(box[key], subBoxesNode, depth + 1);
      }
    });
    boxNode.appendChild(subBoxesNode);
  }

  parentNode.appendChild(boxNode);
};

var makeProperty = function makeProperty(name, value, parentNode) {
  var nameNode = document.createElement('mp4-name');
  var valueNode = document.createElement('mp4-value');
  var propertyNode = document.createElement('mp4-property');

  nameNode.setAttribute('data-name', name);
  nameNode.textContent = name;

  if (value instanceof Uint8Array || value instanceof Uint32Array) {
    var strValue = (0, _commonDataToHexJs2['default'])(value, '');
    var truncValue = strValue.slice(0, 1029); // 21 rows of 16 bytes

    if (truncValue.length < strValue.length) {
      truncValue += '<' + (value.byteLength - 336) + 'b remaining of ' + value.byteLength + 'b total>';
    }

    valueNode.setAttribute('data-value', truncValue.toUpperCase());
    valueNode.innerHTML = truncValue;
    valueNode.classList.add('pre-like');
  } else if (Array.isArray(value)) {
    var strValue = '[' + value.join(', ') + ']';
    valueNode.setAttribute('data-value', strValue);
    valueNode.textContent = strValue;
  } else {
    valueNode.setAttribute('data-value', value);
    valueNode.textContent = value;
  }

  propertyNode.appendChild(nameNode);
  propertyNode.appendChild(valueNode);

  parentNode.appendChild(propertyNode);
};

exports['default'] = {
  inspect: inspectTs,
  domify: domifyTs
};
module.exports = exports['default'];

},{"./common/data-to-hex.js":17,"./common/nal-parse":18}]},{},[16])(16)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L2FjY2Vzcy11bml0LWRlbGltaXRlci5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2JpdC1zdHJlYW1zL2gyNjQvaGRyLXBhcmFtZXRlcnMuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L2luZGV4LmpzIiwiL1VzZXJzL2pyaXZlcmEvcHJvamVjdHMvdGh1bWItY29pbC9zcmMvYml0LXN0cmVhbXMvaDI2NC9saWIvY29tYmluYXRvcnMuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L2xpYi9jb25kaXRpb25hbHMuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L2xpYi9kYXRhLXR5cGVzLmpzIiwiL1VzZXJzL2pyaXZlcmEvcHJvamVjdHMvdGh1bWItY29pbC9zcmMvYml0LXN0cmVhbXMvaDI2NC9saWIvZGlzY2FyZC1lbXVsYXRpb24tcHJldmVudGlvbi5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2JpdC1zdHJlYW1zL2gyNjQvbGliL2V4cC1nb2xvbWItc3RyaW5nLmpzIiwiL1VzZXJzL2pyaXZlcmEvcHJvamVjdHMvdGh1bWItY29pbC9zcmMvYml0LXN0cmVhbXMvaDI2NC9saWIvcmJzcC11dGlscy5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2JpdC1zdHJlYW1zL2gyNjQvcGljLXBhcmFtZXRlci1zZXQuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L3NjYWxpbmctbGlzdC5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2JpdC1zdHJlYW1zL2gyNjQvc2VxLXBhcmFtZXRlci1zZXQuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L3NsaWNlLWhlYWRlci5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2JpdC1zdHJlYW1zL2gyNjQvc2xpY2UtbGF5ZXItd2l0aG91dC1wYXJ0aXRpb25pbmcuanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9iaXQtc3RyZWFtcy9oMjY0L3Z1aS1wYXJhbWV0ZXJzLmpzIiwiL1VzZXJzL2pyaXZlcmEvcHJvamVjdHMvdGh1bWItY29pbC9zcmMvaW5kZXguanMiLCIvVXNlcnMvanJpdmVyYS9wcm9qZWN0cy90aHVtYi1jb2lsL3NyYy9pbnNwZWN0b3JzL2NvbW1vbi9kYXRhLXRvLWhleC5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2luc3BlY3RvcnMvY29tbW9uL25hbC1wYXJzZS5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2luc3BlY3RvcnMvZmx2LmpzIiwiL1VzZXJzL2pyaXZlcmEvcHJvamVjdHMvdGh1bWItY29pbC9zcmMvaW5zcGVjdG9ycy9pbmRleC5qcyIsIi9Vc2Vycy9qcml2ZXJhL3Byb2plY3RzL3RodW1iLWNvaWwvc3JjL2luc3BlY3RvcnMvbXA0LmpzIiwiL1VzZXJzL2pyaXZlcmEvcHJvamVjdHMvdGh1bWItY29pbC9zcmMvaW5zcGVjdG9ycy90cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7OzhCQUUyQixtQkFBbUI7OzRCQUMzQyxrQkFBa0I7O0FBRWxDLElBQU0sUUFB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LENBQUMsRUFDaEMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtyQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsRUFDaEMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtyQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtyQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtyQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtyQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztBQUt0QywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtuQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtuQywyQkFBSyw2QkFBTyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsRUFDakMsMEJBQUssY0FBYyxFQUFFLHVCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVuQywyQkFBSyw2QkFBTyxr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SUFBSSxDQUFDLENBQUM7QUFDUCxZQUFNLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRCxPQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsWUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLE9BQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxZQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckMsTUFBTTtBQUNMLGNBQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxTQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsY0FBTSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsU0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLGNBQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxTQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsY0FBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3JDO0FBQ0QsS0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBR1AsVUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQUFBQyxDQUFDO0FBQy9ELEtBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxVQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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QUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsU0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLGNBQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxTQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsU0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLGNBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNyQztBQUNELEtBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxLQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFVBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxLQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsVUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLEtBQUMsSUFBSSxDQUFDLENBQUM7O0FBRVAsVUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQUFBQyxDQUFDO0FBQzlELEtBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxLQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsVUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsQUFBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxLQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFVBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFF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WUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxhQUFTLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztHQUMvQjs7QUFFRCxjQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLGNBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRXBDLFlBQVUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7Q0FDdEMsQ0FBQzs7cUJBRWE7QUFDYixTQUFPLEVBQUUsU0FBUztBQUNsQixRQUFNLEVBQUUsUUFBUTtDQUNqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7c3RhcnQsIGRhdGEsIGxpc3QsIHZlcmlmeX0gZnJvbSAnLi9saWIvY29tYmluYXRvcnMnO1xuaW1wb3J0IHt1fSBmcm9tICcuL2xpYi9kYXRhLXR5cGVzJztcblxuY29uc3QgYXVkQ29kZWMgPSBzdGFydCgnYWNjZXNzX3VuaXRfZGVsaW1pdGVyJyxcbiAgbGlzdChbXG4gICAgZGF0YSgncHJpbWFyeV9waWNfdHlwZScsIHUoMykpLFxuICAgIHZlcmlmeSgnYWNjZXNzX3VuaXRfZGVsaW1pdGVyJylcbiAgXSkpO1xuXG5leHBvcnQgZGVmYXVsdCBhdWRDb2RlYztcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtsaXN0LCBkYXRhfSBmcm9tICcuL2xpYi9jb21iaW5hdG9ycyc7XG5pbXBvcnQge3UsIHVlfSBmcm9tICcuL2xpYi9kYXRhLXR5cGVzJztcbmltcG9ydCB7ZWFjaH0gZnJvbSAnLi9saWIvY29uZGl0aW9uYWxzJztcblxuaW1wb3J0IHNjYWxpbmdMaXN0IGZyb20gJy4vc2NhbGluZy1saXN0JztcblxubGV0IHYgPSBudWxsO1xuXG5jb25zdCBoZHJQYXJhbWV0ZXJzID0gbGlzdChbXG4gIGRhdGEoJ2NwYl9jbnRfbWludXMxJywgdWUodikpLFxuICBkYXRhKCdiaXRfcmF0ZV9zY2FsZScsIHUoNCkpLFxuICBkYXRhKCdjcGJfc2l6ZV9zY2FsZScsIHUoNCkpLFxuICBlYWNoKChpbmRleCwgb3V0cHV0KSA9PiB7XG4gICAgcmV0dXJuIGluZGV4IDw9IG91dHB1dC5jcGJfY250X21pbnVzMTtcbiAgfSxcbiAgbGlzdChbXG4gICAgZGF0YSgnYml0X3JhdGVfdmFsdWVfbWludXMxW10nLCB1ZSh2KSksXG4gICAgZGF0YSgnY3BiX3NpemVfdmFsdWVfbWludXMxW10nLCB1ZSh2KSksXG4gICAgZGF0YSgnY2JyX2ZsYWdbXScsIHUoMSkpXG4gIF0pKSxcbiAgZGF0YSgnaW5pdGlhbF9jcGJfcmVtb3ZhbF9kZWxheV9sZW5ndGhfbWludXMxJywgdSg1KSksXG4gIGRhdGEoJ2NwYl9yZW1vdmFsX2RlbGF5X2xlbmd0aF9taW51czEnLCB1KDUpKSxcbiAgZGF0YSgnZHBiX291dHB1dF9kZWxheV9sZW5ndGhfbWludXMxJywgdSg1KSksXG4gIGRhdGEoJ3RpbWVfb2Zmc2V0X2xlbmd0aCcsIHUoNSkpXG5dKTtcblxuZXhwb3J0IGRlZmF1bHQgaGRyUGFyYW1ldGVycztcbiIsImltcG9ydCBhY2Nlc3NVbml0RGVsaW1pdGVyIGZyb20gJy4vYWNjZXNzLXVuaXQtZGVsaW1pdGVyJztcbmltcG9ydCBzZXFQYXJhbWV0ZXJTZXQgZnJvbSAnLi9zZXEtcGFyYW1ldGVyLXNldCc7XG5pbXBvcnQgcGljUGFyYW1ldGVyU2V0IGZyb20gJy4vcGljLXBhcmFtZXRlci1zZXQnO1xuaW1wb3J0IHNsaWNlTGF5ZXJXaXRob3V0UGFydGl0aW9uaW5nIGZyb20gJy4vc2xpY2UtbGF5ZXItd2l0aG91dC1wYXJ0aXRpb25pbmcnO1xuaW1wb3J0IGRpc2NhcmRFbXVsYXRpb25QcmV2ZW50aW9uIGZyb20gJy4vbGliL2Rpc2NhcmQtZW11bGF0aW9uLXByZXZlbnRpb24nO1xuXG5jb25zdCBoMjY0Q29kZWNzID0ge1xuICBhY2Nlc3NVbml0RGVsaW1pdGVyLFxuICBzZXFQYXJhbWV0ZXJTZXQsXG4gIHBpY1BhcmFtZXRlclNldCxcbiAgc2xpY2VMYXllcldpdGhvdXRQYXJ0aXRpb25pbmcsXG4gIGRpc2NhcmRFbXVsYXRpb25QcmV2ZW50aW9uXG59O1xuXG5leHBvcnQgZGVmYXVsdCBoMjY0Q29kZWNzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge0V4cEdvbG9tYkVuY29kZXIsIEV4cEdvbG9tYkRlY29kZXJ9IGZyb20gJy4vZXhwLWdvbG9tYi1zdHJpbmcnO1xuaW1wb3J0IHtcbiAgdHlwZWRBcnJheVRvQml0U3RyaW5nLFxuICBiaXRTdHJpbmdUb1R5cGVkQXJyYXksXG4gIHJlbW92ZVJCU1BUcmFpbGluZ0JpdHMsXG4gIGFwcGVuZFJCU1BUcmFpbGluZ0JpdHNcbn0gZnJvbSAnLi9yYnNwLXV0aWxzJztcblxuLyoqXG4gKiBHZW5lcmFsIEV4cEdvbG9tYi1FbmNvZGVkLVN0cnVjdHVyZSBQYXJzZSBGdW5jdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHN0YXJ0ID0gZnVuY3Rpb24gKG5hbWUsIHBhcnNlRm4pIHtcbiAgcmV0dXJuIHtcbiAgICBkZWNvZGU6IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuICAgICAgbGV0IHJhd0JpdFN0cmluZyA9IHR5cGVkQXJyYXlUb0JpdFN0cmluZyhpbnB1dCk7XG4gICAgICBsZXQgYml0U3RyaW5nID0gcmVtb3ZlUkJTUFRyYWlsaW5nQml0cyhyYXdCaXRTdHJpbmcpO1xuICAgICAgbGV0IGV4cEdvbG9tYkRlY29kZXIgPSBuZXcgRXhwR29sb21iRGVjb2RlcihiaXRTdHJpbmcpO1xuICAgICAgbGV0IG91dHB1dCA9IHt9O1xuXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIHBhcnNlRm4uZGVjb2RlKGV4cEdvbG9tYkRlY29kZXIsIG91dHB1dCwgb3B0aW9ucyk7XG4gICAgfSxcbiAgICBlbmNvZGU6IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGV4cEdvbG9tYkVuY29kZXIgPSBuZXcgRXhwR29sb21iRW5jb2RlcigpO1xuXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcGFyc2VGbi5lbmNvZGUoZXhwR29sb21iRW5jb2RlciwgaW5wdXQsIG9wdGlvbnMpO1xuXG4gICAgICBsZXQgb3V0cHV0ID0gZXhwR29sb21iRW5jb2Rlci5iaXRSZXNlcnZvaXI7XG4gICAgICBsZXQgYml0U3RyaW5nID0gYXBwZW5kUkJTUFRyYWlsaW5nQml0cyhvdXRwdXQpO1xuICAgICAgbGV0IGRhdGEgPSBiaXRTdHJpbmdUb1R5cGVkQXJyYXkoYml0U3RyaW5nKTtcblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGxpc3QgPSBmdW5jdGlvbiAocGFyc2VGbnMpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWNvZGU6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIHBhcnNlRm5zLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICAgIG91dHB1dCA9IGZuLmRlY29kZShleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpIHx8IG91dHB1dDtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH0sXG4gICAgZW5jb2RlOiAoZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIHBhcnNlRm5zLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICAgIGZuLmVuY29kZShleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZGF0YSA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhVHlwZSkge1xuICBsZXQgbmFtZVNwbGl0ID0gbmFtZS5zcGxpdCgvXFxbKFxcZCopXFxdLyk7XG4gIGxldCBwcm9wZXJ0eSA9IG5hbWVTcGxpdFswXTtcbiAgbGV0IGluZGV4T3ZlcnJpZGU7XG4gIGxldCBuYW1lQXJyYXk7XG5cbiAgLy8gVGhlIGBuYW1lU3BsaXRgIGFycmF5IGNhbiBlaXRoZXIgYmUgMSBvciAzIGxvbmdcbiAgaWYgKG5hbWVTcGxpdCAmJiBuYW1lU3BsaXRbMF0gIT09ICcnKSB7XG4gICAgaWYgKG5hbWVTcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICBuYW1lQXJyYXkgPSB0cnVlO1xuICAgICAgaW5kZXhPdmVycmlkZSA9IHBhcnNlRmxvYXQobmFtZVNwbGl0WzFdKTtcblxuICAgICAgaWYgKGlzTmFOKGluZGV4T3ZlcnJpZGUpKSB7XG4gICAgICAgIGluZGV4T3ZlcnJpZGUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwR29sb21iRXJyb3I6IEludmFsaWQgbmFtZSBcIicgKyBuYW1lICsgJ1wiLicpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGRlY29kZTogKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IHZhbHVlO1xuXG4gICAgICBpZiAodHlwZW9mIGluZGV4T3ZlcnJpZGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGluZGV4ID0gaW5kZXhPdmVycmlkZTtcbiAgICAgIH1cblxuICAgICAgdmFsdWUgPSBkYXRhVHlwZS5yZWFkKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCk7XG5cbiAgICAgIGlmICghbmFtZUFycmF5KSB7XG4gICAgICAgIG91dHB1dFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvdXRwdXRbcHJvcGVydHldKSkge1xuICAgICAgICAgIG91dHB1dFtwcm9wZXJ0eV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3V0cHV0W3Byb3BlcnR5XVtpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXRwdXRbcHJvcGVydHldLnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfSxcbiAgICBlbmNvZGU6IChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IHZhbHVlO1xuXG4gICAgICBpZiAodHlwZW9mIGluZGV4T3ZlcnJpZGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGluZGV4ID0gaW5kZXhPdmVycmlkZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFuYW1lQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPSBpbnB1dFtwcm9wZXJ0eV07XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob3V0cHV0W3Byb3BlcnR5XSkpIHtcbiAgICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB2YWx1ZSA9IGlucHV0W3Byb3BlcnR5XVtpbmRleF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBpbnB1dFtwcm9wZXJ0eV0uc2hpZnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gZGF0YVR5cGUud3JpdGUoZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgsIHZhbHVlKTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZGVidWcgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gIHJldHVybiB7XG4gICAgZGVjb2RlOiAoZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMsIGluZGV4KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhwcmVmaXgsIGV4cEdvbG9tYi5iaXRSZXNlcnZvaXIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpO1xuICAgIH0sXG4gICAgZW5jb2RlOiAoZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHByZWZpeCwgZXhwR29sb21iLmJpdFJlc2Vydm9pciwgaW5wdXQsIG9wdGlvbnMsIGluZGV4KTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWNvZGU6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIGxldCBsZW4gPSBleHBHb2xvbWIuYml0UmVzZXJ2b2lyLmxlbmd0aDtcbiAgICAgIGlmIChsZW4gIT09IDApIHtcbiAgICAgICAgY29uc29sZS50cmFjZSgnRVJST1I6ICcgKyBuYW1lICsgJyB3YXMgbm90IGNvbXBsZXRlbHkgcGFyc2VkLiBUaGVyZSB3ZXJlICgnICsgbGVuICsgJykgYml0cyByZW1haW5pbmchJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGV4cEdvbG9tYi5vcmlnaW5hbEJpdFJlc2Vydm9pcik7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmNvZGU6IChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCkgPT4ge31cbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBwaWNrT3B0aW9ucyA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWNvZGU6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uc1twcm9wZXJ0eV0gIT09IHVuZGVmaW5lZCkge1xuICAgLy8gICAgIG9wdGlvbnNbcHJvcGVydHldW3ZhbHVlXTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuY29kZTogKGV4cEdvbG9tYiwgaW5wdXQsIG9wdGlvbnMsIGluZGV4KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnNbcHJvcGVydHldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgLy8gICBvcHRpb25zLnZhbHVlcyBvcHRpb25zW3Byb3BlcnR5XVt2YWx1ZV07XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGNvbnN0IHdoZW4gPSBmdW5jdGlvbiAoY29uZGl0aW9uRm4sIHBhcnNlRm4pIHtcbiAgcmV0dXJuIHtcbiAgICBkZWNvZGU6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIGlmIChjb25kaXRpb25GbihvdXRwdXQsIG9wdGlvbnMsIGluZGV4KSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbi5kZWNvZGUoZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMsIGluZGV4KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9LFxuICAgIGVuY29kZTogKGV4cEdvbG9tYiwgaW5wdXQsIG9wdGlvbnMsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoY29uZGl0aW9uRm4oaW5wdXQsIG9wdGlvbnMsIGluZGV4KSkge1xuICAgICAgICBwYXJzZUZuLmVuY29kZShleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGVhY2ggPSBmdW5jdGlvbiAoY29uZGl0aW9uRm4sIHBhcnNlRm4pIHtcbiAgcmV0dXJuIHtcbiAgICBkZWNvZGU6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGluZGV4ID0gMDtcblxuICAgICAgd2hpbGUgKGNvbmRpdGlvbkZuKGluZGV4LCBvdXRwdXQsIG9wdGlvbnMpKSB7XG4gICAgICAgIHBhcnNlRm4uZGVjb2RlKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCk7XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfSxcbiAgICBlbmNvZGU6IChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgICB3aGlsZSAoY29uZGl0aW9uRm4oaW5kZXgsIGlucHV0LCBvcHRpb25zKSkge1xuICAgICAgICBwYXJzZUZuLmVuY29kZShleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCk7XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGluQXJyYXkgPSBmdW5jdGlvbiAobmFtZSwgYXJyYXkpIHtcbiAgbGV0IG5hbWVTcGxpdCA9IG5hbWUuc3BsaXQoL1xcWyhcXGQqKVxcXS8pO1xuICBsZXQgcHJvcGVydHkgPSBuYW1lU3BsaXRbMF07XG4gIGxldCBpbmRleE92ZXJyaWRlO1xuICBsZXQgbmFtZUFycmF5O1xuXG4gIC8vIFRoZSBgbmFtZVNwbGl0YCBhcnJheSBjYW4gZWl0aGVyIGJlIDEgb3IgMyBsb25nXG4gIGlmIChuYW1lU3BsaXQgJiYgbmFtZVNwbGl0WzBdICE9PSAnJykge1xuICAgIGlmIChuYW1lU3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgbmFtZUFycmF5ID0gdHJ1ZTtcbiAgICAgIGluZGV4T3ZlcnJpZGUgPSBwYXJzZUZsb2F0KG5hbWVTcGxpdFsxXSk7XG5cbiAgICAgIGlmIChpc05hTihpbmRleE92ZXJyaWRlKSkge1xuICAgICAgICBpbmRleE92ZXJyaWRlID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cEdvbG9tYkVycm9yOiBJbnZhbGlkIG5hbWUgXCInICsgbmFtZSArICdcIi4nKTtcbiAgfVxuXG4gIHJldHVybiAob2JqLCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgIGlmIChuYW1lQXJyYXkpIHtcbiAgICAgIHJldHVybiAob2JqW3Byb3BlcnR5XSAmJiBhcnJheS5pbmRleE9mKG9ialtwcm9wZXJ0eV1baW5kZXhdKSAhPT0gLTEpIHx8XG4gICAgICAgIChvcHRpb25zW3Byb3BlcnR5XSAmJiBhcnJheS5pbmRleE9mKG9wdGlvbnNbcHJvcGVydHldW2luZGV4XSkgIT09IC0xKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2Yob2JqW3Byb3BlcnR5XSkgIT09IC0xIHx8XG4gICAgICAgIGFycmF5LmluZGV4T2Yob3B0aW9uc1twcm9wZXJ0eV0pICE9PSAtMTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZXF1YWxzID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gIGxldCBuYW1lU3BsaXQgPSBuYW1lLnNwbGl0KC9cXFsoXFxkKilcXF0vKTtcbiAgbGV0IHByb3BlcnR5ID0gbmFtZVNwbGl0WzBdO1xuICBsZXQgaW5kZXhPdmVycmlkZTtcbiAgbGV0IG5hbWVBcnJheTtcblxuICAvLyBUaGUgYG5hbWVTcGxpdGAgYXJyYXkgY2FuIGVpdGhlciBiZSAxIG9yIDMgbG9uZ1xuICBpZiAobmFtZVNwbGl0ICYmIG5hbWVTcGxpdFswXSAhPT0gJycpIHtcbiAgICBpZiAobmFtZVNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIG5hbWVBcnJheSA9IHRydWU7XG4gICAgICBpbmRleE92ZXJyaWRlID0gcGFyc2VGbG9hdChuYW1lU3BsaXRbMV0pO1xuXG4gICAgICBpZiAoaXNOYU4oaW5kZXhPdmVycmlkZSkpIHtcbiAgICAgICAgaW5kZXhPdmVycmlkZSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBHb2xvbWJFcnJvcjogSW52YWxpZCBuYW1lIFwiJyArIG5hbWUgKyAnXCIuJyk7XG4gIH1cblxuICByZXR1cm4gKG9iaiwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICBpZiAobmFtZUFycmF5KSB7XG4gICAgICByZXR1cm4gKG9ialtwcm9wZXJ0eV0gJiYgb2JqW3Byb3BlcnR5XVtpbmRleF0gPT09IHZhbHVlKSB8fFxuICAgICAgICAob3B0aW9uc1twcm9wZXJ0eV0gJiYgb3B0aW9uc1twcm9wZXJ0eV1baW5kZXhdID09PSB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmpbcHJvcGVydHldID09PSB2YWx1ZSB8fFxuICAgICAgICBvcHRpb25zW3Byb3BlcnR5XSA9PT0gdmFsdWU7XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IG5vdCA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gKG9iaiwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICByZXR1cm4gIWZuKG9iaiwgb3B0aW9ucywgaW5kZXgpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNvbWUgPSBmdW5jdGlvbiAoY29uZGl0aW9uRm5zKSB7XG4gIHJldHVybiAob2JqLCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgIHJldHVybiBjb25kaXRpb25GbnMuc29tZSgoZm4pPT5mbihvYmosIG9wdGlvbnMsIGluZGV4KSk7XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZXZlcnkgPSBmdW5jdGlvbiAoY29uZGl0aW9uRm5zKSB7XG4gIHJldHVybiAob2JqLCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgIHJldHVybiBjb25kaXRpb25GbnMuZXZlcnkoKGZuKT0+Zm4ob2JqLCBvcHRpb25zLCBpbmRleCkpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHdoZW5Nb3JlRGF0YSA9IGZ1bmN0aW9uIChwYXJzZUZuKSB7XG4gIHJldHVybiB7XG4gICAgZGVjb2RlOiAoZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoZXhwR29sb21iLmJpdFJlc2Vydm9pci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRm4uZGVjb2RlKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH0sXG4gICAgZW5jb2RlOiAoZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgIHBhcnNlRm4uZW5jb2RlKGV4cEdvbG9tYiwgaW5wdXQsIG9wdGlvbnMsIGluZGV4KTtcbiAgICB9XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBnZXROdW1CaXRzID0gKG51bUJpdHMsIGV4cEdvbG9tYiwgZGF0YSwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgaWYgKHR5cGVvZiBudW1CaXRzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG51bUJpdHMoZXhwR29sb21iLCBkYXRhLCBvcHRpb25zLCBpbmRleCk7XG4gIH1cbiAgcmV0dXJuIG51bUJpdHM7XG59O1xuXG5jb25zdCBkYXRhVHlwZXMgPSB7XG4gIHU6IChudW1CaXRzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlYWQ6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGJpdHNUb1JlYWQgPSBnZXROdW1CaXRzKG51bUJpdHMsIGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCk7XG5cbiAgICAgICAgcmV0dXJuIGV4cEdvbG9tYi5yZWFkQml0cyhiaXRzVG9SZWFkKTtcbiAgICAgIH0sXG4gICAgICB3cml0ZTogKGV4cEdvbG9tYiwgaW5wdXQsIG9wdGlvbnMsIGluZGV4LCB2YWx1ZSkgPT4ge1xuICAgICAgICBsZXQgYml0c1RvV3JpdGUgPSBnZXROdW1CaXRzKG51bUJpdHMsIGV4cEdvbG9tYiwgaW5wdXQsIG9wdGlvbnMsIGluZGV4KTtcblxuICAgICAgICBleHBHb2xvbWIud3JpdGVCaXRzKHZhbHVlLCBiaXRzVG9Xcml0ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgZjogKG51bUJpdHMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVhZDogKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgICAgICBsZXQgYml0c1RvUmVhZCA9IGdldE51bUJpdHMobnVtQml0cywgZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMsIGluZGV4KTtcblxuICAgICAgICByZXR1cm4gZXhwR29sb21iLnJlYWRCaXRzKGJpdHNUb1JlYWQpO1xuICAgICAgfSxcbiAgICAgIHdyaXRlOiAoZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgsIHZhbHVlKSA9PiB7XG4gICAgICAgIGxldCBiaXRzVG9Xcml0ZSA9IGdldE51bUJpdHMobnVtQml0cywgZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgpO1xuXG4gICAgICAgIGV4cEdvbG9tYi53cml0ZUJpdHModmFsdWUsIGJpdHNUb1dyaXRlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB1ZTogKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICByZWFkOiAoZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMsIGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiBleHBHb2xvbWIucmVhZFVuc2lnbmVkRXhwR29sb21iKCk7XG4gICAgICB9LFxuICAgICAgd3JpdGU6IChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCwgdmFsdWUpID0+IHtcbiAgICAgICAgZXhwR29sb21iLndyaXRlVW5zaWduZWRFeHBHb2xvbWIodmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIHNlOiAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlYWQ6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgICAgcmV0dXJuIGV4cEdvbG9tYi5yZWFkRXhwR29sb21iKCk7XG4gICAgICB9LFxuICAgICAgd3JpdGU6IChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCwgdmFsdWUpID0+IHtcbiAgICAgICAgZXhwR29sb21iLndyaXRlRXhwR29sb21iKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICBiOiAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlYWQ6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICAgICAgcmV0dXJuIGV4cEdvbG9tYi5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICB9LFxuICAgICAgd3JpdGU6IChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCwgdmFsdWUpID0+IHtcbiAgICAgICAgZXhwR29sb21iLndyaXRlVW5zaWduZWRCeXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB2YWw6ICh2YWwpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVhZDogKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiB2YWwoZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfSxcbiAgICAgIHdyaXRlOiAoZXhwR29sb21iLCBpbnB1dCwgb3B0aW9ucywgaW5kZXgsIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdmFsKEV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkYXRhVHlwZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGRpc2NhcmRFbXVsYXRpb25QcmV2ZW50aW9uQnl0ZXMgPSAoZGF0YSkgPT4ge1xuICBsZXQgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gIGxldCBlbXVsYXRpb25QcmV2ZW50aW9uQnl0ZXNQb3NpdGlvbnMgPSBbXTtcbiAgbGV0IGkgPSAxO1xuICBsZXQgbmV3TGVuZ3RoO1xuICBsZXQgbmV3RGF0YTtcblxuICAvLyBGaW5kIGFsbCBgRW11bGF0aW9uIFByZXZlbnRpb24gQnl0ZXNgXG4gIHdoaWxlIChpIDwgbGVuZ3RoIC0gMikge1xuICAgIGlmIChkYXRhW2ldID09PSAwICYmIGRhdGFbaSArIDFdID09PSAwICYmIGRhdGFbaSArIDJdID09PSAweDAzKSB7XG4gICAgICBlbXVsYXRpb25QcmV2ZW50aW9uQnl0ZXNQb3NpdGlvbnMucHVzaChpICsgMik7XG4gICAgICBpICs9IDI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICAvLyBJZiBubyBFbXVsYXRpb24gUHJldmVudGlvbiBCeXRlcyB3ZXJlIGZvdW5kIGp1c3QgcmV0dXJuIHRoZSBvcmlnaW5hbFxuICAvLyBhcnJheVxuICBpZiAoZW11bGF0aW9uUHJldmVudGlvbkJ5dGVzUG9zaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IGFycmF5IHRvIGhvbGQgdGhlIE5BTCB1bml0IGRhdGFcbiAgbmV3TGVuZ3RoID0gbGVuZ3RoIC0gZW11bGF0aW9uUHJldmVudGlvbkJ5dGVzUG9zaXRpb25zLmxlbmd0aDtcbiAgbmV3RGF0YSA9IG5ldyBVaW50OEFycmF5KG5ld0xlbmd0aCk7XG4gIHZhciBzb3VyY2VJbmRleCA9IDA7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5ld0xlbmd0aDsgc291cmNlSW5kZXgrKywgaSsrKSB7XG4gICAgaWYgKHNvdXJjZUluZGV4ID09PSBlbXVsYXRpb25QcmV2ZW50aW9uQnl0ZXNQb3NpdGlvbnNbMF0pIHtcbiAgICAgIC8vIFNraXAgdGhpcyBieXRlXG4gICAgICBzb3VyY2VJbmRleCsrO1xuICAgICAgLy8gUmVtb3ZlIHRoaXMgcG9zaXRpb24gaW5kZXhcbiAgICAgIGVtdWxhdGlvblByZXZlbnRpb25CeXRlc1Bvc2l0aW9ucy5zaGlmdCgpO1xuICAgIH1cbiAgICBuZXdEYXRhW2ldID0gZGF0YVtzb3VyY2VJbmRleF07XG4gIH1cblxuICByZXR1cm4gbmV3RGF0YTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRpc2NhcmRFbXVsYXRpb25QcmV2ZW50aW9uQnl0ZXM7XG4iLCIvKipcbiAqIFRvb2xzIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgRXhwR29sb21iIGRhdGEgZnJvbSBhIGJpdC1zdHJpbmdcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgY29uc3QgRXhwR29sb21iRGVjb2RlciA9IGZ1bmN0aW9uIChiaXRTdHJpbmcpIHtcbiAgdGhpcy5iaXRSZXNlcnZvaXIgPSBiaXRTdHJpbmc7XG4gIHRoaXMub3JpZ2luYWxCaXRSZXNlcnZvaXIgPSBiaXRTdHJpbmc7XG59O1xuXG5FeHBHb2xvbWJEZWNvZGVyLnByb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcyA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IGkgPSAwO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5iaXRSZXNlcnZvaXIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGhpcy5iaXRSZXNlcnZvaXJbaV0gPT09ICcxJykge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufTtcblxuRXhwR29sb21iRGVjb2Rlci5wcm90b3R5cGUucmVhZFVuc2lnbmVkRXhwR29sb21iID0gZnVuY3Rpb24gKCkge1xuICBsZXQgemVyb3MgPSB0aGlzLmNvdW50TGVhZGluZ1plcm9zKCk7XG4gIGxldCBiaXRDb3VudCA9IHplcm9zICogMiArIDE7XG5cbiAgbGV0IHZhbCA9IHBhcnNlSW50KHRoaXMuYml0UmVzZXJ2b2lyLnNsaWNlKHplcm9zLCBiaXRDb3VudCksIDIpO1xuXG4gIHZhbCAtPSAxO1xuXG4gIHRoaXMuYml0UmVzZXJ2b2lyID0gdGhpcy5iaXRSZXNlcnZvaXIuc2xpY2UoYml0Q291bnQpO1xuXG4gIHJldHVybiB2YWw7XG59O1xuXG5FeHBHb2xvbWJEZWNvZGVyLnByb3RvdHlwZS5yZWFkRXhwR29sb21iID0gZnVuY3Rpb24gKCkge1xuICBsZXQgdmFsID0gdGhpcy5yZWFkVW5zaWduZWRFeHBHb2xvbWIoKTtcblxuICBpZiAodmFsICE9PSAwKSB7XG4gICAgaWYgKHZhbCAmIDB4MSkge1xuICAgICAgdmFsID0gKHZhbCArIDEpIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsID0gLSh2YWwgLyAyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsO1xufTtcblxuRXhwR29sb21iRGVjb2Rlci5wcm90b3R5cGUucmVhZEJpdHMgPSBmdW5jdGlvbiAoYml0Q291bnQpIHtcbiAgbGV0IHZhbCA9IHBhcnNlSW50KHRoaXMuYml0UmVzZXJ2b2lyLnNsaWNlKDAsIGJpdENvdW50KSwgMik7XG5cbiAgdGhpcy5iaXRSZXNlcnZvaXIgPSB0aGlzLmJpdFJlc2Vydm9pci5zbGljZShiaXRDb3VudCk7XG5cbiAgcmV0dXJuIHZhbDtcbn07XG5cblxuRXhwR29sb21iRGVjb2Rlci5wcm90b3R5cGUucmVhZFVuc2lnbmVkQnl0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMud3JpdGVCaXRzKDgpO1xufTtcblxuZXhwb3J0IGNvbnN0IEV4cEdvbG9tYkVuY29kZXIgPSBmdW5jdGlvbiAoYml0U3RyaW5nKSB7XG4gIHRoaXMuYml0UmVzZXJ2b2lyID0gYml0U3RyaW5nIHx8ICcnO1xufTtcblxuRXhwR29sb21iRW5jb2Rlci5wcm90b3R5cGUud3JpdGVVbnNpZ25lZEV4cEdvbG9tYiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBsZXQgdGVtcFN0ciA9ICcnO1xuICBsZXQgYml0VmFsdWUgPSAodmFsdWUgKyAxKS50b1N0cmluZygyKTtcbiAgbGV0IG51bUJpdHMgPSBiaXRWYWx1ZS5sZW5ndGggLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQml0czsgaSsrKSB7XG4gICAgdGVtcFN0ciArPSAnMCc7XG4gIH1cblxuICB0aGlzLmJpdFJlc2Vydm9pciArPSB0ZW1wU3RyICsgYml0VmFsdWU7XG59O1xuXG5FeHBHb2xvbWJFbmNvZGVyLnByb3RvdHlwZS53cml0ZUV4cEdvbG9tYiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgPD0gMCkge1xuICAgIHZhbHVlID0gLXZhbHVlICogMjtcbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IHZhbHVlICogMiAtIDE7XG4gIH1cblxuICB0aGlzLndyaXRlVW5zaWduZWRFeHBHb2xvbWIodmFsdWUpO1xufTtcblxuRXhwR29sb21iRW5jb2Rlci5wcm90b3R5cGUud3JpdGVCaXRzID0gZnVuY3Rpb24gKGJpdFdpZHRoLCB2YWx1ZSkge1xuICBsZXQgdGVtcFN0ciA9ICcnO1xuICBsZXQgYml0VmFsdWUgPSAodmFsdWUgJiAoKDEgPDwgYml0V2lkdGgpLTEpKS50b1N0cmluZygyKTtcbiAgbGV0IG51bUJpdHMgPSBiaXRXaWR0aCAtIGJpdFZhbHVlLmxlbmd0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUJpdHM7IGkrKykge1xuICAgIHRlbXBTdHIgKz0gJzAnO1xuICB9XG5cbiAgdGhpcy5iaXRSZXNlcnZvaXIgKz0gdGVtcFN0ciArIGJpdFZhbHVlO1xufTtcblxuRXhwR29sb21iRW5jb2Rlci5wcm90b3R5cGUud3JpdGVVbnNpZ25lZEJ5dGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdGhpcy53cml0ZUJpdHMoOCwgdmFsdWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGNvbnN0IHR5cGVkQXJyYXlUb0JpdFN0cmluZyA9IChkYXRhKSA9PiB7XG4gIHZhciBhcnJheSA9IFtdO1xuICB2YXIgYnl0ZXNQZXJFbGVtZW50ID0gZGF0YS5CWVRFU19QRVJfRUxFTUVOVCB8fCAxO1xuICB2YXIgcHJlZml4WmVyb3MgPSAnJztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheS5wdXNoKGRhdGFbaV0pO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlc1BlckVsZW1lbnQ7IGkrKykge1xuICAgIHByZWZpeFplcm9zICs9ICcwMDAwMDAwMCc7XG4gIH1cblxuICByZXR1cm4gYXJyYXlcbiAgICAubWFwKChuKSA9PiAocHJlZml4WmVyb3MgKyBuLnRvU3RyaW5nKDIpKS5zbGljZSgtYnl0ZXNQZXJFbGVtZW50ICogOCkpXG4gICAgLmpvaW4oJycpO1xufTtcblxuZXhwb3J0IGNvbnN0IGJpdFN0cmluZ1RvVHlwZWRBcnJheSA9IChiaXRTdHJpbmcpID0+IHtcbiAgbGV0IGJpdHNOZWVkZWQgPSA4IC0gKGJpdFN0cmluZy5sZW5ndGggJSA4KTtcblxuICAvLyBQYWQgd2l0aCB6ZXJvcyB0byBtYWtlIGxlbmd0aCBhIG11bHRpcGxlIG9mIDhcbiAgZm9yIChsZXQgaSA9IDA7IGJpdHNOZWVkZWQgIT09OCAmJiBpIDwgYml0c05lZWRlZDsgaSsrKSB7XG4gICAgYml0U3RyaW5nICs9ICcwJztcbiAgfVxuXG4gIGxldCBvdXRwdXRBcnJheSA9IGJpdFN0cmluZy5tYXRjaCgvKC57OH0pL2cpO1xuICBsZXQgbnVtYmVyQXJyYXkgPSBvdXRwdXRBcnJheS5tYXAoKG4pID0+IHBhcnNlSW50KG4sIDIpKTtcblxuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkobnVtYmVyQXJyYXkpO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZVJCU1BUcmFpbGluZ0JpdHMgPSAoYml0cykgPT4ge1xuICByZXR1cm4gYml0cy5zcGxpdCgvMTAqJC8pWzBdO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGVuZFJCU1BUcmFpbGluZ0JpdHMgPSAoYml0cykgPT4ge1xuICBsZXQgYml0U3RyaW5nID0gYml0cyArICcxMDAwMDAwMCc7XG5cbiAgcmV0dXJuIGJpdFN0cmluZy5zbGljZSgwLCAtKGJpdFN0cmluZy5sZW5ndGggJSA4KSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge3N0YXJ0LCBsaXN0LCBkYXRhLCBkZWJ1ZywgdmVyaWZ5fSBmcm9tICcuL2xpYi9jb21iaW5hdG9ycyc7XG5pbXBvcnQge1xuICB3aGVuLFxuICBlYWNoLFxuICBpbkFycmF5LFxuICBlcXVhbHMsXG4gIHNvbWUsXG4gIGV2ZXJ5LFxuICBub3QsXG4gIHdoZW5Nb3JlRGF0YVxufSBmcm9tICcuL2xpYi9jb25kaXRpb25hbHMnO1xuaW1wb3J0IHt1ZSwgdSwgc2UsIHZhbH0gZnJvbSAnLi9saWIvZGF0YS10eXBlcyc7XG5cbmltcG9ydCBzY2FsaW5nTGlzdCBmcm9tICcuL3NjYWxpbmctbGlzdCc7XG5cbmxldCB2ID0gbnVsbDtcblxuY29uc3QgcHBzQ29kZWMgPSBzdGFydCgncGljX3BhcmFtZXRlcl9zZXQnLFxuICBsaXN0KFtcbiAgICBkYXRhKCdwaWNfcGFyYW1ldGVyX3NldF9pZCcsICB1ZSh2KSksXG4gICAgZGF0YSgnc2VxX3BhcmFtZXRlcl9zZXRfaWQnLCAgdWUodikpLFxuLy8gICAgcGlja09wdGlvbnMoJ3NwcycsICdzZXFfcGFyYW1ldGVyX3NldF9pZCcpLFxuICAgIGRhdGEoJ2VudHJvcHlfY29kaW5nX21vZGVfZmxhZycsICB1KDEpKSxcbiAgICBkYXRhKCdib3R0b21fZmllbGRfcGljX29yZGVyX2luX2ZyYW1lX3ByZXNlbnRfZmxhZycsICB1KDEpKSxcbiAgICBkYXRhKCdudW1fc2xpY2VfZ3JvdXBzX21pbnVzMScsICB1ZSh2KSksXG4gICAgd2hlbihub3QoZXF1YWxzKCdudW1fc2xpY2VfZ3JvdXBzX21pbnVzMScsIDApKSxcbiAgICAgIGxpc3QoW1xuICAgICAgICBkYXRhKCdzbGljZV9ncm91cF9tYXBfdHlwZScsICB1ZSh2KSksXG4gICAgICAgIHdoZW4oZXF1YWxzKCdzbGljZV9ncm91cF9tYXBfdHlwZScsIDApLFxuICAgICAgICAgIGVhY2goKGluZGV4LCBvdXRwdXQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluZGV4IDw9IG91dHB1dC5udW1fc2xpY2VfZ3JvdXBzX21pbnVzMTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhKCdydW5fbGVuZ3RoX21pbnVzMVtdJywgIHVlKHYpKSkpLFxuICAgICAgICB3aGVuKGVxdWFscygnc2xpY2VfZ3JvdXBfbWFwX3R5cGUnLCAyKSxcbiAgICAgICAgICBlYWNoKChpbmRleCwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBpbmRleCA8PSBvdXRwdXQubnVtX3NsaWNlX2dyb3Vwc19taW51czE7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGlzdChbXG4gICAgICAgICAgICAgIGRhdGEoJ3RvcF9sZWZ0W10nLCAgdWUodikpLFxuICAgICAgICAgICAgICBkYXRhKCdib3R0b21fcmlnaHRbXScsICB1ZSh2KSksXG4gICAgICAgICAgICBdKSkpLFxuICAgICAgICB3aGVuKGluQXJyYXkoJ3NsaWNlX2dyb3VwX21hcF90eXBlJywgWzMsIDQsIDVdKSxcbiAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgIGRhdGEoJ3NsaWNlX2dyb3VwX2NoYW5nZV9kaXJlY3Rpb25fZmxhZycsICB1KDEpKSxcbiAgICAgICAgICAgIGRhdGEoJ3NsaWNlX2dyb3VwX2NoYW5nZV9yYXRlX21pbnVzMScsICB1ZSh2KSlcbiAgICAgICAgICBdKSksXG4gICAgICAgIHdoZW4oZXF1YWxzKCdzbGljZV9ncm91cF9tYXBfdHlwZScsIDYpLFxuICAgICAgICAgIGxpc3QoW1xuICAgICAgICAgICAgZGF0YSgncGljX3NpemVfaW5fbWFwX3VuaXRzX21pbnVzMScsICB1ZSh2KSksXG4gICAgICAgICAgICBlYWNoKChpbmRleCwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4IDw9IG91dHB1dC5waWNfc2l6ZV9pbl9tYXBfdW5pdHNfbWludXMxO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkYXRhKCdzbGljZV9ncm91cF9pZFtdJywgIHVlKHYpKSlcbiAgICAgICAgICBdKSlcbiAgICAgIF0pKSxcbiAgICBkYXRhKCdudW1fcmVmX2lkeF9sMF9kZWZhdWx0X2FjdGl2ZV9taW51czEnLCAgdWUodikpLFxuICAgIGRhdGEoJ251bV9yZWZfaWR4X2wxX2RlZmF1bHRfYWN0aXZlX21pbnVzMScsICB1ZSh2KSksXG4gICAgZGF0YSgnd2VpZ2h0ZWRfcHJlZF9mbGFnJywgIHUoMSkpLFxuICAgIGRhdGEoJ3dlaWdodGVkX2JpcHJlZF9pZGMnLCAgdSgyKSksXG4gICAgZGF0YSgncGljX2luaXRfcXBfbWludXMyNicsICBzZSh2KSksXG4gICAgZGF0YSgncGljX2luaXRfcXNfbWludXMyNicsICBzZSh2KSksXG4gICAgZGF0YSgnY2hyb21hX3FwX2luZGV4X29mZnNldCcsICBzZSh2KSksXG4gICAgZGF0YSgnZGVibG9ja2luZ19maWx0ZXJfY29udHJvbF9wcmVzZW50X2ZsYWcnLCAgdSgxKSksXG4gICAgZGF0YSgnY29uc3RyYWluZWRfaW50cmFfcHJlZF9mbGFnJywgIHUoMSkpLFxuICAgIGRhdGEoJ3JlZHVuZGFudF9waWNfY250X3ByZXNlbnRfZmxhZycsICB1KDEpKSxcbiAgICB3aGVuTW9yZURhdGEobGlzdChbXG4gICAgICBkYXRhKCd0cmFuc2Zvcm1fOHg4X21vZGVfZmxhZycsICB1KDEpKSxcbiAgICAgIGRhdGEoJ3BpY19zY2FsaW5nX21hdHJpeF9wcmVzZW50X2ZsYWcnLCAgdSgxKSksXG4gICAgICB3aGVuKGVxdWFscygncGljX3NjYWxpbmdfbWF0cml4X3ByZXNlbnRfZmxhZycsIDEpLFxuICAgICAgICBlYWNoKChpbmRleCwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPCA2ICsgKChvdXRwdXQuY2hyb21hX2Zvcm1hdF9JZGMgIT09IDMpID8gMiA6IDYpICogb3V0cHV0LnRyYW5zZm9ybV84eDhfbW9kZV9mbGFnO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbGlzdChbXG4gICAgICAgICAgICBkYXRhKCdwaWNfc2NhbGluZ19saXN0X3ByZXNlbnRfZmxhZ1tdJywgIHUoMSkpLFxuICAgICAgICAgICAgd2hlbihlcXVhbHMoJ3BpY19zY2FsaW5nX2xpc3RfcHJlc2VudF9mbGFnW10nLCAxKSxcbiAgICAgICAgICAgICAgc2NhbGluZ0xpc3QpXG4gICAgICAgICAgXSkpKSxcbiAgICAgIGRhdGEoJ3NlY29uZF9jaHJvbWFfcXBfaW5kZXhfb2Zmc2V0JywgIHNlKHYpKVxuICAgIF0pKSxcbiAgICB2ZXJpZnkoJ3BpY19wYXJhbWV0ZXJfc2V0JylcbiAgXSkpO1xuXG5leHBvcnQgZGVmYXVsdCBwcHNDb2RlYztcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc2NhbGluZ0xpc3QgPSB7XG4gIGRlY29kZTogZnVuY3Rpb24gKGV4cEdvbG9tYiwgb3V0cHV0LCBvcHRpb25zLCBpbmRleCkge1xuICAgIGxldCBsYXN0U2NhbGUgPSA4O1xuICAgIGxldCBuZXh0U2NhbGUgPSA4O1xuICAgIGxldCBkZWx0YVNjYWxlO1xuICAgIGxldCBjb3VudCA9IDE2O1xuICAgIGxldCBzY2FsaW5nQXJyID0gW107XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkob3V0cHV0LnNjYWxpbmdMaXN0KSkge1xuICAgICAgb3V0cHV0LnNjYWxpbmdMaXN0ID0gW107XG4gICAgfVxuXG4gICAgaWYgKGluZGV4ID49IDYpIHtcbiAgICAgIGNvdW50ID0gNjQ7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBjb3VudDsgaisrKSB7XG4gICAgICBpZiAobmV4dFNjYWxlICE9PSAwKSB7XG4gICAgICAgIGRlbHRhU2NhbGUgPSBleHBHb2xvbWIucmVhZEV4cEdvbG9tYigpO1xuICAgICAgICBuZXh0U2NhbGUgPSAobGFzdFNjYWxlICsgZGVsdGFTY2FsZSArIDI1NikgJSAyNTY7XG4gICAgICB9XG5cbiAgICAgIHNjYWxpbmdBcnJbal0gPSAobmV4dFNjYWxlID09PSAwKSA/IGxhc3RTY2FsZSA6IG5leHRTY2FsZTtcbiAgICAgIGxhc3RTY2FsZSA9IHNjYWxpbmdBcnJbal07XG4gICAgfVxuXG4gICAgb3V0cHV0LnNjYWxpbmdMaXN0W2luZGV4XSA9IHNjYWxpbmdBcnI7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9LFxuICBlbmNvZGU6IGZ1bmN0aW9uIChleHBHb2xvbWIsIGlucHV0LCBvcHRpb25zLCBpbmRleCkge1xuICAgIGxldCBsYXN0U2NhbGUgPSA4O1xuICAgIGxldCBuZXh0U2NhbGUgPSA4O1xuICAgIGxldCBkZWx0YVNjYWxlO1xuICAgIGxldCBjb3VudCA9IDE2O1xuICAgIGxldCBvdXRwdXQgPSAnJztcblxuICAgIGlmICghQXJyYXkuaXNBcnJheShpbnB1dC5zY2FsaW5nTGlzdCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBpZiAoaW5kZXggPj0gNikge1xuICAgICAgY291bnQgPSA2NDtcbiAgICB9XG5cbiAgICBsZXQgc2NhbGluZ0FyciA9IG91dHB1dC5zY2FsaW5nTGlzdFtpbmRleF07XG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvdW50OyBqKyspIHtcbiAgICAgIGlmIChzY2FsaW5nQXJyW2pdID09PSBsYXN0U2NhbGUpIHtcbiAgICAgICAgb3V0cHV0ICs9IGV4cEdvbG9tYi53cml0ZUV4cEdvbG9tYigtbGFzdFNjYWxlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBuZXh0U2NhbGUgPSBzY2FsaW5nQXJyW2pdIC0gbGFzdFNjYWxlO1xuICAgICAgb3V0cHV0ICs9IGV4cEdvbG9tYi53cml0ZUV4cEdvbG9tYihuZXh0U2NhbGUpO1xuICAgICAgbGFzdFNjYWxlID0gc2NhbGluZ0FycltqXTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2NhbGluZ0xpc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7c3RhcnQsIGxpc3QsIGRhdGEsIGRlYnVnLCB2ZXJpZnl9IGZyb20gJy4vbGliL2NvbWJpbmF0b3JzJztcbmltcG9ydCB7d2hlbiwgZWFjaCwgaW5BcnJheSwgZXF1YWxzLCBzb21lLCBldmVyeSwgbm90fSBmcm9tICcuL2xpYi9jb25kaXRpb25hbHMnO1xuaW1wb3J0IHt1ZSwgdSwgc2UsIHZhbH0gZnJvbSAnLi9saWIvZGF0YS10eXBlcyc7XG5cbmltcG9ydCBzY2FsaW5nTGlzdCBmcm9tICcuL3NjYWxpbmctbGlzdCc7XG5pbXBvcnQgdnVpUGFyYW10ZXJzIGZyb20gJy4vdnVpLXBhcmFtZXRlcnMnO1xuXG5sZXQgdiA9IG51bGw7XG5cbmxldCBQUk9GSUxFU19XSVRIX09QVElPTkFMX1NQU19EQVRBID0gW1xuICA0NCwgODMsIDg2LCAxMDAsIDExMCwgMTE4LCAxMjIsIDEyOCxcbiAgMTM0LCAxMzgsIDEzOSwgMjQ0XG5dO1xuXG5sZXQgZ2V0Q2hyb21hRm9ybWF0SWRjVmFsdWUgPSB7XG4gIHJlYWQ6IChleHBHb2xvbWIsIG91dHB1dCwgb3B0aW9ucywgaW5kZXgpID0+IHtcbiAgICByZXR1cm4gb3V0cHV0LmNocm9tYV9mb3JtYXRfaWRjIHx8IG9wdGlvbnMuY2hyb21hX2Zvcm1hdF9pZGM7XG4gIH0sXG4gIHdyaXRlOigpPT57fVxufTtcblxuLyoqXG4gICogTk9XIHdlIGFyZSByZWFkeSB0byBidWlsZCBhbiBTUFMgcGFyc2VyIVxuICAqL1xuY29uc3Qgc3BzQ29kZWMgPSBzdGFydCgnc2VxX3BhcmFtZXRlcl9zZXQnLFxuICBsaXN0KFtcbiAgICAvLyBkZWZhdWx0c1xuICAgIGRhdGEoJ2Nocm9tYV9mb3JtYXRfaWRjJywgdmFsKDEpKSxcbiAgICBkYXRhKCd2aWRlb19mb3JtYXQnLCB2YWwoNSkpLFxuICAgIGRhdGEoJ2NvbG9yX3ByaW1hcmllcycsIHZhbCgyKSksXG4gICAgZGF0YSgndHJhbnNmZXJfY2hhcmFjdGVyaXN0aWNzJywgdmFsKDIpKSxcbiAgICBkYXRhKCdzYW1wbGVfcmF0aW8nLCB2YWwoMS4wKSksXG5cbiAgICBkYXRhKCdwcm9maWxlX2lkYycsIHUoOCkpLFxuICAgIGRhdGEoJ2NvbnN0cmFpbnRfc2V0MF9mbGFnJywgdSgxKSksXG4gICAgZGF0YSgnY29uc3RyYWludF9zZXQxX2ZsYWcnLCB1KDEpKSxcbiAgICBkYXRhKCdjb25zdHJhaW50X3NldDJfZmxhZycsIHUoMSkpLFxuICAgIGRhdGEoJ2NvbnN0cmFpbnRfc2V0M19mbGFnJywgdSgxKSksXG4gICAgZGF0YSgnY29uc3RyYWludF9zZXQ0X2ZsYWcnLCB1KDEpKSxcbiAgICBkYXRhKCdjb25zdHJhaW50X3NldDVfZmxhZycsIHUoMSkpLFxuICAgIGRhdGEoJ2NvbnN0cmFpbnRfc2V0Nl9mbGFnJywgdSgxKSksXG4gICAgZGF0YSgnY29uc3RyYWludF9zZXQ3X2ZsYWcnLCB1KDEpKSxcbiAgICBkYXRhKCdsZXZlbF9pZGMnLCB1KDgpKSxcbiAgICBkYXRhKCdzZXFfcGFyYW1ldGVyX3NldF9pZCcsIHVlKHYpKSxcbiAgICB3aGVuKGluQXJyYXkoJ3Byb2ZpbGVfaWRjJywgUFJPRklMRVNfV0lUSF9PUFRJT05BTF9TUFNfREFUQSksXG4gICAgICBsaXN0KFtcbiAgICAgICAgZGF0YSgnY2hyb21hX2Zvcm1hdF9pZGMnLCB1ZSh2KSksXG4gICAgICAgIHdoZW4oZXF1YWxzKCdjaHJvbWFfZm9ybWF0X2lkYycsIDMpLFxuICAgICAgICAgIGRhdGEoJ3NlcGFyYXRlX2NvbG91cl9wbGFuZV9mbGFnJywgdSgxKSkpLFxuICAgICAgICB3aGVuKG5vdChlcXVhbHMoJ2Nocm9tYV9mb3JtYXRfaWRjJywgMykpLFxuICAgICAgICAgIGRhdGEoJ3NlcGFyYXRlX2NvbG91cl9wbGFuZV9mbGFnJywgdmFsKDApKSksXG4gICAgICAgIGRhdGEoJ2JpdF9kZXB0aF9sdW1hX21pbnVzOCcsIHVlKHYpKSxcbiAgICAgICAgZGF0YSgnYml0X2RlcHRoX2Nocm9tYV9taW51czgnLCB1ZSh2KSksXG4gICAgICAgIGRhdGEoJ3FwcHJpbWVfeV96ZXJvX3RyYW5zZm9ybV9ieXBhc3NfZmxhZycsIHUoMSkpLFxuICAgICAgICBkYXRhKCdzZXFfc2NhbGluZ19tYXRyaXhfcHJlc2VudF9mbGFnJywgdSgxKSksXG4gICAgICAgIHdoZW4oZXF1YWxzKCdzZXFfc2NhbGluZ19tYXRyaXhfcHJlc2VudF9mbGFnJywgMSksXG4gICAgICAgICAgZWFjaCgoaW5kZXgsIG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gaW5kZXggPCAoKG91dHB1dC5jaHJvbWFfZm9ybWF0X2lkYyAhPT0gMykgPyA4IDogMTIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxpc3QoW1xuICAgICAgICAgICAgICBkYXRhKCdzZXFfc2NhbGluZ19saXN0X3ByZXNlbnRfZmxhZ1tdJywgdSgxKSksXG4gICAgICAgICAgICAgIHdoZW4oZXF1YWxzKCdzZXFfc2NhbGluZ19saXN0X3ByZXNlbnRfZmxhZ1tdJywgMSksXG4gICAgICAgICAgICAgICAgc2NhbGluZ0xpc3QpXG4gICAgICAgICAgICBdKSkpXG4gICAgICBdKSksXG4gICAgZGF0YSgnbG9nMl9tYXhfZnJhbWVfbnVtX21pbnVzNCcsIHVlKHYpKSxcbiAgICBkYXRhKCdwaWNfb3JkZXJfY250X3R5cGUnLCB1ZSh2KSksXG4gICAgd2hlbihlcXVhbHMoJ3BpY19vcmRlcl9jbnRfdHlwZScsIDApLFxuICAgICAgZGF0YSgnbG9nMl9tYXhfcGljX29yZGVyX2NudF9sc2JfbWludXM0JywgdWUodikpKSxcbiAgICB3aGVuKGVxdWFscygncGljX29yZGVyX2NudF90eXBlJywgMSksXG4gICAgICBsaXN0KFtcbiAgICAgICAgZGF0YSgnZGVsdGFfcGljX29yZGVyX2Fsd2F5c196ZXJvX2ZsYWcnLCB1KDEpKSxcbiAgICAgICAgZGF0YSgnb2Zmc2V0X2Zvcl9ub25fcmVmX3BpYycsIHNlKHYpKSxcbiAgICAgICAgZGF0YSgnb2Zmc2V0X2Zvcl90b3BfdG9fYm90dG9tX2ZpZWxkJywgc2UodikpLFxuICAgICAgICBkYXRhKCdudW1fcmVmX2ZyYW1lc19pbl9waWNfb3JkZXJfY250X2N5Y2xlJywgdWUodikpLFxuICAgICAgICBlYWNoKChpbmRleCwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPCBvdXRwdXQubnVtX3JlZl9mcmFtZXNfaW5fcGljX29yZGVyX2NudF9jeWNsZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRhdGEoJ29mZnNldF9mb3JfcmVmX2ZyYW1lW10nLCBzZSh2KSkpXG4gICAgICBdKSksXG4gICAgZGF0YSgnbWF4X251bV9yZWZfZnJhbWVzJywgdWUodikpLFxuICAgIGRhdGEoJ2dhcHNfaW5fZnJhbWVfbnVtX3ZhbHVlX2FsbG93ZWRfZmxhZycsIHUoMSkpLFxuICAgIGRhdGEoJ3BpY193aWR0aF9pbl9tYnNfbWludXMxJywgdWUodikpLFxuICAgIGRhdGEoJ3BpY19oZWlnaHRfaW5fbWFwX3VuaXRzX21pbnVzMScsIHVlKHYpKSxcbiAgICBkYXRhKCdmcmFtZV9tYnNfb25seV9mbGFnJywgdSgxKSksXG4gICAgd2hlbihlcXVhbHMoJ2ZyYW1lX21ic19vbmx5X2ZsYWcnLCAwKSxcbiAgICAgIGRhdGEoJ21iX2FkYXB0aXZlX2ZyYW1lX2ZpZWxkX2ZsYWcnLCB1KDEpKSksXG4gICAgZGF0YSgnZGlyZWN0Xzh4OF9pbmZlcmVuY2VfZmxhZycsIHUoMSkpLFxuICAgIGRhdGEoJ2ZyYW1lX2Nyb3BwaW5nX2ZsYWcnLCB1KDEpKSxcbiAgICB3aGVuKGVxdWFscygnZnJhbWVfY3JvcHBpbmdfZmxhZycsIDEpLFxuICAgICAgbGlzdChbXG4gICAgICAgIGRhdGEoJ2ZyYW1lX2Nyb3BfbGVmdF9vZmZzZXQnLCB1ZSh2KSksXG4gICAgICAgIGRhdGEoJ2ZyYW1lX2Nyb3BfcmlnaHRfb2Zmc2V0JywgdWUodikpLFxuICAgICAgICBkYXRhKCdmcmFtZV9jcm9wX3RvcF9vZmZzZXQnLCB1ZSh2KSksXG4gICAgICAgIGRhdGEoJ2ZyYW1lX2Nyb3BfYm90dG9tX29mZnNldCcsIHVlKHYpKVxuICAgICAgXSkpLFxuICAgIGRhdGEoJ3Z1aV9wYXJhbWV0ZXJzX3ByZXNlbnRfZmxhZycsIHUoMSkpLFxuICAgIHdoZW4oZXF1YWxzKCd2dWlfcGFyYW1ldGVyc19wcmVzZW50X2ZsYWcnLCAxKSwgdnVpUGFyYW10ZXJzKSxcbiAgICAvLyBUaGUgZm9sbG93aW5nIGZpZWxkIGlzIGEgZGVyaXZlZCB2YWx1ZSB0aGF0IGlzIHVzZWQgZm9yIHBhcnNpbmdcbiAgICAvLyBzbGljZSBoZWFkZXJzXG4gICAgd2hlbihlcXVhbHMoJ3NlcGFyYXRlX2NvbG91cl9wbGFuZV9mbGFnJywgMSksXG4gICAgICBkYXRhKCdDaHJvbWFBcnJheVR5cGUnLCB2YWwoMCkpKSxcbiAgICB3aGVuKGVxdWFscygnc2VwYXJhdGVfY29sb3VyX3BsYW5lX2ZsYWcnLCAwKSxcbiAgICAgIGRhdGEoJ0Nocm9tYUFycmF5VHlwZScsIGdldENocm9tYUZvcm1hdElkY1ZhbHVlKSksXG4gICAgdmVyaWZ5KCdzZXFfcGFyYW1ldGVyX3NldCcpXG4gIF0pKTtcblxuZXhwb3J0IGRlZmF1bHQgc3BzQ29kZWM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7c3RhcnQsIGxpc3QsIGRhdGEsIGRlYnVnLCB2ZXJpZnl9IGZyb20gJy4vbGliL2NvbWJpbmF0b3JzJztcbmltcG9ydCB7d2hlbiwgZWFjaCwgaW5BcnJheSwgZXF1YWxzLCBzb21lLCBldmVyeSwgbm90fSBmcm9tICcuL2xpYi9jb25kaXRpb25hbHMnO1xuaW1wb3J0IHt1ZSwgdSwgc2UsIHZhbH0gZnJvbSAnLi9saWIvZGF0YS10eXBlcyc7XG5cbmxldCB2ID0gbnVsbDtcblxubGV0IHNsaWNlVHlwZSA9IHtcbiAgUDogWzAsIDVdLFxuICBCOiBbMSwgNl0sXG4gIEk6IFsyLCA3XSxcbiAgU1A6IFszLCA4XSxcbiAgU0k6IFs0LCA5XVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbnMgZm9yIGNhbGN1bGF0aW5nIHRoZSBudW1iZXIgb2YgYml0cyB0byByZWFkIGZvciBjZXJ0YWluXG4gKiBwcm9wZXJ0aWVzIGJhc2VkIG9uIHRoZSB2YWx1ZXMgaW4gb3RoZXIgcHJvcGVydGllcyAodXN1YWxseSBzcGVjaWZpZWRcbiAqIGluIHRoZSBTUFMpXG4gKi9cbmxldCBmcmFtZU51bUJpdHMgPSAoZXhwR29sb21iLCBkYXRhLCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICByZXR1cm4gb3B0aW9ucy5sb2cyX21heF9mcmFtZV9udW1fbWludXM0ICsgNDtcbn07XG5cbmxldCBwaWNPcmRlckNudEJpdHMgPSAoZXhwR29sb21iLCBkYXRhLCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICByZXR1cm4gb3B0aW9ucy5sb2cyX21heF9waWNfb3JkZXJfY250X2xzYl9taW51czQgKyA0O1xufTtcblxubGV0IHNsaWNlR3JvdXBDaGFuZ2VDeWNsZUJpdHMgPSAoZXhwR29sb21iLCBkYXRhLCBvcHRpb25zLCBpbmRleCkgPT4ge1xuICBsZXQgcGljSGVpZ2h0SW5NYXBVbml0cyA9IG9wdGlvbnMucGljX2hlaWdodF9pbl9tYXBfdW5pdHNfbWludXMxICsgMTtcbiAgbGV0IHBpY1dpZHRoSW5NYnMgPSBvcHRpb25zLnBpY193aWR0aF9pbl9tYnNfbWludXMxICsgMTtcbiAgbGV0IHNsaWNlR3JvdXBDaGFuZ2VSYXRlID0gb3B0aW9ucy5zbGljZV9ncm91cF9jaGFuZ2VfcmF0ZV9taW51czEgKyAxO1xuICBsZXQgcGljU2l6ZUluTWFwVW5pdHMgPSBwaWNXaWR0aEluTWJzICogcGljSGVpZ2h0SW5NYXBVbml0cztcblxuICByZXR1cm4gTWF0aC5jZWlsKE1hdGgubG9nKHBpY1NpemVJbk1hcFVuaXRzIC8gc2xpY2VHcm91cENoYW5nZVJhdGUgKyAxKSAvIE1hdGguTE4yKTtcbn07XG5cbmxldCB1c2VXZWlnaHRlZFByZWRpY3Rpb25UYWJsZSA9IHNvbWUoW1xuICBldmVyeShbXG4gICAgZXF1YWxzKCd3ZWlnaHRlZF9wcmVkX2ZsYWcnLCAxKSxcbiAgICBzb21lKFtcbiAgICAgIGluQXJyYXkoJ3NsaWNlX3R5cGUnLCBzbGljZVR5cGUuUCksXG4gICAgICBpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLlNQKVxuICAgIF0pXG4gIF0pLFxuICBldmVyeShbXG4gICAgZXF1YWxzKCd3ZWlnaHRlZF9iaXByZWRfaWRjJywgMSksXG4gICAgaW5BcnJheSgnc2xpY2VfdHlwZScsIHNsaWNlVHlwZS5CKSxcbiAgXSlcbl0pO1xuXG5sZXQgcmVmUGljTGlzdE1vZGlmaWNhdGlvbiA9IGxpc3QoW1xuICB3aGVuKGV2ZXJ5KFtcbiAgICAgIG5vdChpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLkkpKSxcbiAgICAgIG5vdChpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLlNJKSlcbiAgICBdKSwgbGlzdChbXG4gICAgICBkYXRhKCdyZWZfcGljX2xpc3RfbW9kaWZpY2F0aW9uX2ZsYWdfbDAnLCB1KDEpKSxcbiAgICAgIHdoZW4oZXF1YWxzKCdyZWZfcGljX2xpc3RfbW9kaWZpY2F0aW9uX2ZsYWdfbDAnLCAxKSxcbiAgICAgICAgZWFjaCgoaW5kZXgsIG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID09PSAwIHx8IG91dHB1dC5tb2RpZmljYXRpb25fb2ZfcGljX251bXNfaWRjX2wwW2luZGV4IC0gMV0gIT09IDM7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgIGRhdGEoJ21vZGlmaWNhdGlvbl9vZl9waWNfbnVtc19pZGNfbDBbXScsIHVlKHYpKSxcbiAgICAgICAgICAgIHdoZW4oaW5BcnJheSgnbW9kaWZpY2F0aW9uX29mX3BpY19udW1zX2lkY19sMFtdJywgWzAsIDFdKSxcbiAgICAgICAgICAgICAgZGF0YSgnYWJzX2RpZmZfcGljX251bV9taW51czFfbDBbXScsIHVlKHYpKSksXG4gICAgICAgICAgICB3aGVuKGVxdWFscygnbW9kaWZpY2F0aW9uX29mX3BpY19udW1zX2lkY19sMFtdJywgMiksXG4gICAgICAgICAgICAgIGRhdGEoJ2xvbmdfdGVybV9waWNfbnVtX2wwW10nLCB1ZSh2KSkpXG4gICAgICAgICAgXSkpKVxuICAgIF0pKSxcbiAgd2hlbihpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLkIpLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgncmVmX3BpY19saXN0X21vZGlmaWNhdGlvbl9mbGFnX2wxJywgdSgxKSksXG4gICAgICB3aGVuKGVxdWFscygncmVmX3BpY19saXN0X21vZGlmaWNhdGlvbl9mbGFnX2wxJywgMSksXG4gICAgICAgIGVhY2goKGluZGV4LCBvdXRwdXQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA9PT0gMCB8fCBvdXRwdXQubW9kaWZpY2F0aW9uX29mX3BpY19udW1zX2lkY19sMVtpbmRleCAtIDFdICE9PSAzO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbGlzdChbXG4gICAgICAgICAgICBkYXRhKCdtb2RpZmljYXRpb25fb2ZfcGljX251bXNfaWRjX2wxW10nLCB1ZSh2KSksXG4gICAgICAgICAgICB3aGVuKGluQXJyYXkoJ21vZGlmaWNhdGlvbl9vZl9waWNfbnVtc19pZGNfbDFbXScsIFswLCAxXSksXG4gICAgICAgICAgICAgIGRhdGEoJ2Fic19kaWZmX3BpY19udW1fbWludXMxX2wxW10nLCB1ZSh2KSkpLFxuICAgICAgICAgICAgd2hlbihlcXVhbHMoJ21vZGlmaWNhdGlvbl9vZl9waWNfbnVtc19pZGNfbDFbXScsIDIpLFxuICAgICAgICAgICAgICBkYXRhKCdsb25nX3Rlcm1fcGljX251bV9sMVtdJywgdWUodikpKVxuICAgICAgICAgIF0pKSlcbiAgICBdKSlcbl0pO1xuXG5sZXQgcmVmUGljTGlzdE12Y01vZGlmaWNhdGlvbiA9IHtcbiAgZW5jb2RlOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcigncmVmX3BpY19saXN0X212Y19tb2RpZmljYXRpb246IE5PVCBJTVBMRU1FTlRFRCEnKX0sXG4gIGRlY29kZTogKCkgPT4ge3Rocm93IG5ldyBFcnJvcigncmVmX3BpY19saXN0X212Y19tb2RpZmljYXRpb246IE5PVCBJTVBMRU1FTlRFRCEnKX1cbn07XG5cbmxldCBwcmVkV2VpZ2h0VGFibGUgPSBsaXN0KFtcbiAgZGF0YSgnbHVtYV9sb2cyX3dlaWdodF9kZW5vbScsIHVlKHYpKSxcbiAgd2hlbihub3QoZXF1YWxzKCdDaHJvbWFBcnJheVR5cGUnLCAwKSksXG4gICAgZGF0YSgnY2hyb21hX2xvZzJfd2VpZ2h0X2Rlbm9tJywgdWUodikpKSxcbiAgZWFjaCgoaW5kZXgsIG91dHB1dCkgPT4ge1xuICAgICAgcmV0dXJuIGluZGV4IDw9IG91dHB1dC5udW1fcmVmX2lkeF9sMF9hY3RpdmVfbWludXMxO1xuICAgIH0sXG4gICAgbGlzdChbXG4gICAgICBkYXRhKCdsdW1hX3dlaWdodF9sMF9mbGFnJywgdSgxKSksXG4gICAgICB3aGVuKGVxdWFscygnbHVtYV93ZWlnaHRfbDBfZmxhZycsIDEpLFxuICAgICAgICBsaXN0KFtcbiAgICAgICAgICBkYXRhKCdsdW1hX3dlaWdodF9sMFtdJywgc2UodikpLFxuICAgICAgICAgIGRhdGEoJ2x1bWFfb2Zmc2V0X2wwW10nLCBzZSh2KSksXG4gICAgICAgICAgd2hlbihub3QoZXF1YWxzKCdDaHJvbWFBcnJheVR5cGUnLCAwKSksXG4gICAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgICAgZGF0YSgnY2hyb21hX3dlaWdodF9sMF9mbGFnJywgdSgxKSksXG4gICAgICAgICAgICAgIHdoZW4oZXF1YWxzKCdjaHJvbWFfd2VpZ2h0X2wwX2ZsYWcnLCAxKSxcbiAgICAgICAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgICAgICAgIGRhdGEoJ2Nocm9tYV93ZWlnaHRfbDBfQ3JbXScsIHNlKHYpKSxcbiAgICAgICAgICAgICAgICAgIGRhdGEoJ2Nocm9tYV9vZmZzZXRfbDBfQ3JbXScsIHNlKHYpKSxcbiAgICAgICAgICAgICAgICAgIGRhdGEoJ2Nocm9tYV93ZWlnaHRfbDBfQ2JbXScsIHNlKHYpKSxcbiAgICAgICAgICAgICAgICAgIGRhdGEoJ2Nocm9tYV9vZmZzZXRfbDBfQ2JbXScsIHNlKHYpKVxuICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgXSkpXG4gICAgICAgIF0pKVxuICAgIF0pKSxcbiAgd2hlbihpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLkIpLFxuICAgIGVhY2goKGluZGV4LCBvdXRwdXQpID0+IHtcbiAgICAgICAgcmV0dXJuIGluZGV4IDw9IG91dHB1dC5udW1fcmVmX2lkeF9sMV9hY3RpdmVfbWludXMxO1xuICAgICAgfSxcbiAgICAgIGxpc3QoW1xuICAgICAgICBkYXRhKCdsdW1hX3dlaWdodF9sMV9mbGFnJywgdSgxKSksXG4gICAgICAgIHdoZW4oZXF1YWxzKCdsdW1hX3dlaWdodF9sMV9mbGFnJywgMSksXG4gICAgICAgICAgbGlzdChbXG4gICAgICAgICAgICBkYXRhKCdsdW1hX3dlaWdodF9sMVtdJywgc2UodikpLFxuICAgICAgICAgICAgZGF0YSgnbHVtYV9vZmZzZXRfbDFbXScsIHNlKHYpKSxcbiAgICAgICAgICAgIHdoZW4obm90KGVxdWFscygnQ2hyb21hQXJyYXlUeXBlJywgMCkpLFxuICAgICAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgICAgICBkYXRhKCdjaHJvbWFfd2VpZ2h0X2wxX2ZsYWcnLCB1KDEpKSxcbiAgICAgICAgICAgICAgICB3aGVuKGVxdWFscygnY2hyb21hX3dlaWdodF9sMV9mbGFnJywgMSksXG4gICAgICAgICAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSgnY2hyb21hX3dlaWdodF9sMV9DcltdJywgc2UodikpLFxuICAgICAgICAgICAgICAgICAgICBkYXRhKCdjaHJvbWFfb2Zmc2V0X2wxX0NyW10nLCBzZSh2KSksXG4gICAgICAgICAgICAgICAgICAgIGRhdGEoJ2Nocm9tYV93ZWlnaHRfbDFfQ2JbXScsIHNlKHYpKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YSgnY2hyb21hX29mZnNldF9sMV9DYltdJywgc2UodikpXG4gICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgXSkpXG4gICAgICBdKSkpXG5dKTtcblxubGV0IGRlY1JlZlBpY01hcmtpbmcgPSBsaXN0KFtcbiAgd2hlbihlcXVhbHMoJ25hbF91bml0X3R5cGUnLCA1KSxcbiAgICBsaXN0KFtcbiAgICAgIGRhdGEoJ25vX291dHB1dF9vZl9wcmlvcl9waWNzX2ZsYWcnLCB1KDEpKSxcbiAgICAgIGRhdGEoJ2xvbmdfdGVybV9yZWZlcmVuY2VfZmxhZycsIHUoMSkpXG4gICAgXSkpLFxuICB3aGVuKG5vdChlcXVhbHMoJ25hbF91bml0X3R5cGUnLCA1KSksXG4gICAgbGlzdChbXG4gICAgICBkYXRhKCdhZGFwdGl2ZV9yZWZfcGljX21hcmtpbmdfbW9kZV9mbGFnJywgdSgxKSksXG4gICAgICB3aGVuKGVxdWFscygnYWRhcHRpdmVfcmVmX3BpY19tYXJraW5nX21vZGVfZmxhZycsIDEpLFxuICAgICAgICBlYWNoKChpbmRleCwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPT09IDAgfHwgb3V0cHV0Lm1lbW9yeV9tYW5hZ2VtZW50X2NvbnRyb2xfb3BlcmF0aW9uW2luZGV4IC0gMV0gIT09IDA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBsaXN0KFtcbiAgICAgICAgICAgIGRhdGEoJ21lbW9yeV9tYW5hZ2VtZW50X2NvbnRyb2xfb3BlcmF0aW9uW10nLCB1ZSh2KSksXG4gICAgICAgICAgICB3aGVuKGluQXJyYXkoJ21lbW9yeV9tYW5hZ2VtZW50X2NvbnRyb2xfb3BlcmF0aW9uW10nLCBbMSwgM10pLFxuICAgICAgICAgICAgICBkYXRhKCdkaWZmZXJlbmNlX29mX3BpY19udW1zX21pbnVzMVtdJywgdWUodikpKSxcbiAgICAgICAgICAgIHdoZW4oaW5BcnJheSgnbWVtb3J5X21hbmFnZW1lbnRfY29udHJvbF9vcGVyYXRpb25bXScsIFsyXSksXG4gICAgICAgICAgICAgIGRhdGEoJ2xvbmdfdGVybV9waWNfbnVtW10nLCB1ZSh2KSkpLFxuICAgICAgICAgICAgd2hlbihpbkFycmF5KCdtZW1vcnlfbWFuYWdlbWVudF9jb250cm9sX29wZXJhdGlvbltdJywgWzMsIDZdKSxcbiAgICAgICAgICAgICAgZGF0YSgnbG9uZ190ZXJtX2ZyYW1lX2lkeFtdJywgdWUodikpKSxcbiAgICAgICAgICAgIHdoZW4oaW5BcnJheSgnbWVtb3J5X21hbmFnZW1lbnRfY29udHJvbF9vcGVyYXRpb25bXScsIFs0XSksXG4gICAgICAgICAgICAgIGRhdGEoJ21heF9sb25nX3Rlcm1fZnJhbWVfaWR4X3BsdXMxW10nLCB1ZSh2KSkpXG4gICAgICAgICAgXSkpKVxuICAgIF0pKVxuXSk7XG5cbmNvbnN0IHNsaWNlSGVhZGVyID0gbGlzdChbXG4gIGRhdGEoJ2ZpcnN0X21iX2luX3NsaWNlJywgdWUodikpLFxuICBkYXRhKCdzbGljZV90eXBlJywgdWUodikpLFxuICBkYXRhKCdwaWNfcGFyYW1ldGVyX3NldF9pZCcsIHVlKHYpKSxcbiAgd2hlbihlcXVhbHMoJ3NlcGFyYXRlX2NvbG91cl9wbGFuZV9mbGFnJywgMSksXG4gICAgZGF0YSgnY29sb3VyX3BsYW5lX2lkJywgdSgyKSkpLFxuICBkYXRhKCdmcmFtZV9udW0nLCB1KGZyYW1lTnVtQml0cykpLFxuICB3aGVuKGVxdWFscygnZnJhbWVfbWJzX29ubHlfZmxhZycsIDApLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgnZmllbGRfcGljX2ZsYWcnLCB1KDEpKSxcbiAgICAgIHdoZW4oZXF1YWxzKCdmaWVsZF9waWNfZmxhZycsIDEpLFxuICAgICAgICBkYXRhKCdib3R0b21fZmllbGRfZmxhZycsIHUoMSkpKSxcbiAgICBdKSksXG4gIHdoZW4oZXF1YWxzKCdpZHJQaWNGbGFnJywgMSksXG4gICAgZGF0YSgnaWRyX3BpY19pZCcsIHVlKHYpKSksXG4gIHdoZW4oZXF1YWxzKCdwaWNfb3JkZXJfY250X3R5cGUnLCAwKSxcbiAgICBsaXN0KFtcbiAgICAgIGRhdGEoJ3BpY19vcmRlcl9jbnRfbHNiJywgdShwaWNPcmRlckNudEJpdHMpKSxcbiAgICAgIHdoZW4oZXZlcnkoW1xuICAgICAgICBlcXVhbHMoJ2JvdHRvbV9maWVsZF9waWNfb3JkZXJfaW5fZnJhbWVfcHJlc2VudF9mbGFnJywgMSksXG4gICAgICAgIG5vdChlcXVhbHMoJ2ZpZWxkX3BpY19mbGFnJywgMSkpXG4gICAgICBdKSwgZGF0YSgnZGVsdGFfcGljX29yZGVyX2NudF9ib3R0b20nLCBzZSh2KSkpXG4gICAgXSkpLFxuICB3aGVuKGV2ZXJ5KFtcbiAgICAgIGVxdWFscygncGljX29yZGVyX2NudF90eXBlJywgMSksXG4gICAgICBub3QoZXF1YWxzKCdkZWx0YV9waWNfb3JkZXJfYWx3YXlzX3plcm9fZmxhZycsIDEpKVxuICAgIF0pLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgnZGVsdGFfcGljX29yZGVyX2NudFswXScsIHNlKHYpKSxcbiAgICAgIHdoZW4oZXZlcnkoW1xuICAgICAgICAgIGVxdWFscygnYm90dG9tX2ZpZWxkX3BpY19vcmRlcl9pbl9mcmFtZV9wcmVzZW50X2ZsYWcnLCAxKSxcbiAgICAgICAgICBub3QoZXF1YWxzKCdmaWVsZF9waWNfZmxhZycsIDEpKVxuICAgICAgICBdKSwgZGF0YSgnZGVsdGFfcGljX29yZGVyX2NudFsxXScsIHNlKHYpKSlcbiAgICBdKSksXG4gIHdoZW4oZXF1YWxzKCdyZWR1bmRhbnRfcGljX2NudF9wcmVzZW50X2ZsYWcnLCAxKSxcbiAgICBkYXRhKCdyZWR1bmRhbnRfcGljX2NudCcsIHVlKHYpKSksXG4gIHdoZW4oaW5BcnJheSgnc2xpY2VfdHlwZScsIHNsaWNlVHlwZS5CKSxcbiAgICBkYXRhKCdkaXJlY3Rfc3BhdGlhbF9tdl9wcmVkX2ZsYWcnLCB1KDEpKSksXG4gIHdoZW4oc29tZShbXG4gICAgICBpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLlApLFxuICAgICAgaW5BcnJheSgnc2xpY2VfdHlwZScsIHNsaWNlVHlwZS5TUCksXG4gICAgICBpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLkIpXG4gICAgXSksIGxpc3QoW1xuICAgICAgZGF0YSgnbnVtX3JlZl9pZHhfYWN0aXZlX292ZXJyaWRlX2ZsYWcnLCB1KDEpKSxcbiAgICAgIHdoZW4oZXF1YWxzKCdudW1fcmVmX2lkeF9hY3RpdmVfb3ZlcnJpZGVfZmxhZycsIDEpLFxuICAgICAgICBsaXN0KFtcbiAgICAgICAgICBkYXRhKCdudW1fcmVmX2lkeF9sMF9hY3RpdmVfbWludXMxJywgdWUodikpLFxuICAgICAgICAgIHdoZW4oaW5BcnJheSgnc2xpY2VfdHlwZScsIHNsaWNlVHlwZS5CKSxcbiAgICAgICAgICAgIGRhdGEoJ251bV9yZWZfaWR4X2wxX2FjdGl2ZV9taW51czEnLCB1ZSh2KSkpXG4gICAgICAgIF0pKVxuICAgIF0pKSxcbiAgd2hlbihzb21lKFtcbiAgICAgIGVxdWFscygnbmFsX3VuaXRfdHlwZScsIDIwKSxcbiAgICAgIGVxdWFscygnbmFsX3VuaXRfdHlwZScsIDIxKVxuICAgIF0pLCByZWZQaWNMaXN0TXZjTW9kaWZpY2F0aW9uKSxcbiAgd2hlbihldmVyeShbXG4gICAgICBub3QoZXF1YWxzKCduYWxfdW5pdF90eXBlJywgMjApKSxcbiAgICAgIG5vdChlcXVhbHMoJ25hbF91bml0X3R5cGUnLCAyMSkpXG4gICAgXSksIHJlZlBpY0xpc3RNb2RpZmljYXRpb24pLFxuICB3aGVuKHVzZVdlaWdodGVkUHJlZGljdGlvblRhYmxlLCBwcmVkV2VpZ2h0VGFibGUpLFxuICB3aGVuKG5vdChlcXVhbHMoJ25hbF9yZWZfaWRjJywgMCkpLCBkZWNSZWZQaWNNYXJraW5nKSxcbiAgd2hlbihldmVyeShbXG4gICAgZXF1YWxzKCdlbnRyb3B5X2NvZGluZ19tb2RlX2ZsYWcnLCAxKSxcbiAgICBub3QoaW5BcnJheSgnc2xpY2VfdHlwZScsIHNsaWNlVHlwZS5JKSksXG4gICAgbm90KGluQXJyYXkoJ3NsaWNlX3R5cGUnLCBzbGljZVR5cGUuU0kpKVxuICBdKSwgZGF0YSgnY2FiYWNfaW5pdF9pZGMnLCB1ZSh2KSkpLFxuICBkYXRhKCdzbGljZV9xcF9kZWx0YScsIHNlKHYpKSxcbiAgd2hlbihpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLlNQKSxcbiAgICBkYXRhKCdzcF9mb3Jfc3dpdGNoX2ZsYWcnLCB1KDEpKSksXG4gIHdoZW4oc29tZShbXG4gICAgICBpbkFycmF5KCdzbGljZV90eXBlJywgc2xpY2VUeXBlLlNQKSxcbiAgICAgIGluQXJyYXkoJ3NsaWNlX3R5cGUnLCBzbGljZVR5cGUuU0kpLFxuICAgIF0pLCBkYXRhKCdzbGljZV9xc19kZWx0YScsIHNlKHYpKSksXG4gIHdoZW4oZXF1YWxzKCdkZWJsb2NraW5nX2ZpbHRlcl9jb250cm9sX3ByZXNlbnRfZmxhZycsIDEpLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgnZGlzYWJsZV9kZWJsb2NraW5nX2ZpbHRlcl9pZGMnLCB1ZSh2KSksXG4gICAgICB3aGVuKG5vdChlcXVhbHMoJ2Rpc2FibGVfZGVibG9ja2luZ19maWx0ZXJfaWRjJywgMSkpLFxuICAgICAgICBsaXN0KFtcbiAgICAgICAgICBkYXRhKCdzbGljZV9hbHBoYV9jMF9vZmZzZXRfZGl2MicsIHNlKHYpKSxcbiAgICAgICAgICBkYXRhKCdzbGljZV9iZXRhX29mZnNldF9kaXYyJywgc2UodikpLFxuICAgICAgICBdKSlcbiAgICBdKSksXG4gIHdoZW4oZXZlcnkoW1xuICAgICAgbm90KGVxdWFscygnbnVtX3NsaWNlX2dyb3Vwc19taW51czEnLCAwKSksXG4gICAgICBzb21lKFtcbiAgICAgICAgZXF1YWxzKCdzbGljZV9ncm91cF9tYXBfdHlwZScsIDMpLFxuICAgICAgICBlcXVhbHMoJ3NsaWNlX2dyb3VwX21hcF90eXBlJywgNCksXG4gICAgICAgIGVxdWFscygnc2xpY2VfZ3JvdXBfbWFwX3R5cGUnLCA1KSxcbiAgICAgIF0pXG4gICAgXSksXG4gICAgZGF0YSgnc2xpY2VfZ3JvdXBfY2hhbmdlX2N5Y2xlJywgdShzbGljZUdyb3VwQ2hhbmdlQ3ljbGVCaXRzKSkpXG5dKTtcblxuZXhwb3J0IGRlZmF1bHQgc2xpY2VIZWFkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBzbGljZUhlYWRlciBmcm9tICcuL3NsaWNlLWhlYWRlcic7XG5pbXBvcnQge3N0YXJ0LCBsaXN0fSBmcm9tICcuL2xpYi9jb21iaW5hdG9ycyc7XG5cbmNvbnN0IHNsaWNlTGF5ZXJXaXRob3V0UGFydGl0aW9uaW5nQ29kZWMgPSBzdGFydCgnc2xpY2VfbGF5ZXJfd2l0aG91dF9wYXJ0aXRpb25pbmcnLFxuICBsaXN0KFtcbiAgIHNsaWNlSGVhZGVyXG4gIC8vIFRPRE86IHNsaWNlX2RhdGFcbiAgXSkpO1xuXG5cbmV4cG9ydCBkZWZhdWx0IHNsaWNlTGF5ZXJXaXRob3V0UGFydGl0aW9uaW5nQ29kZWM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7c3RhcnQsIGxpc3QsIGRhdGF9IGZyb20gJy4vbGliL2NvbWJpbmF0b3JzJztcbmltcG9ydCB7d2hlbiwgZXF1YWxzLCBzb21lfSBmcm9tICcuL2xpYi9jb25kaXRpb25hbHMnO1xuaW1wb3J0IHt1ZSwgdSwgdmFsfSBmcm9tICcuL2xpYi9kYXRhLXR5cGVzJztcblxuaW1wb3J0IGhkclBhcmFtZXRlcnMgZnJvbSAnLi9oZHItcGFyYW1ldGVycyc7XG5cbmxldCB2ID0gbnVsbDtcblxubGV0IHNhbXBsZVJhdGlvQ2FsYyA9IGxpc3QoW1xuICAvKlxuICAgIDE6MVxuICAgNzY4MHg0MzIwIDE2OjkgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAzODQweDIxNjAgMTY6OSBmcmFtZSB3aXRob3V0IGhvcml6b250YWwgb3ZlcnNjYW5cbiAgIDEyODB4NzIwIDE2OjkgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAxOTIweDEwODAgMTY6OSBmcmFtZSB3aXRob3V0IGhvcml6b250YWwgb3ZlcnNjYW4gKGNyb3BwZWQgZnJvbSAxOTIweDEwODgpXG4gICA2NDB4NDgwIDQ6MyBmcmFtZSB3aXRob3V0IGhvcml6b250YWwgb3ZlcnNjYW5cbiAgICovXG4gIHdoZW4oZXF1YWxzKCdhc3BlY3RfcmF0aW9faWRjJywgMSksXG4gICAgZGF0YSgnc2FtcGxlX3JhdGlvJywgdmFsKDEpKSksXG4gIC8qXG4gICAgMTI6MTFcbiAgIDcyMHg1NzYgNDozIGZyYW1lIHdpdGggaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgMzUyeDI4OCA0OjMgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDIpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgxMiAvIDExKSkpLFxuICAvKlxuICAgIDEwOjExXG4gICA3MjB4NDgwIDQ6MyBmcmFtZSB3aXRoIGhvcml6b250YWwgb3ZlcnNjYW5cbiAgIDM1MngyNDAgNDozIGZyYW1lIHdpdGhvdXQgaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgKi9cbiAgd2hlbihlcXVhbHMoJ2FzcGVjdF9yYXRpb19pZGMnLCAzKSxcbiAgICBkYXRhKCdzYW1wbGVfcmF0aW8nLCB2YWwoMTAgLyAxMSkpKSxcbiAgLypcbiAgICAxNjoxMVxuICAgNzIweDU3NiAxNjo5IGZyYW1lIHdpdGggaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgNTI4eDU3NiA0OjMgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDQpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgxNiAvIDExKSkpLFxuICAvKlxuICAgIDQwOjMzXG4gICA3MjB4NDgwIDE2OjkgZnJhbWUgd2l0aCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICA1Mjh4NDgwIDQ6MyBmcmFtZSB3aXRob3V0IGhvcml6b250YWwgb3ZlcnNjYW5cbiAgICovXG4gIHdoZW4oZXF1YWxzKCdhc3BlY3RfcmF0aW9faWRjJywgNSksXG4gICAgZGF0YSgnc2FtcGxlX3JhdGlvJywgdmFsKDQwIC8gMzMpKSksXG4gIC8qXG4gICAgMjQ6MTFcbiAgIDM1Mng1NzYgNDozIGZyYW1lIHdpdGhvdXQgaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgNDgweDU3NiAxNjo5IGZyYW1lIHdpdGggaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgKi9cbiAgd2hlbihlcXVhbHMoJ2FzcGVjdF9yYXRpb19pZGMnLCA2KSxcbiAgICBkYXRhKCdzYW1wbGVfcmF0aW8nLCB2YWwoMjQgLyAxMSkpKSxcbiAgLypcbiAgICAyMDoxMVxuICAgMzUyeDQ4MCA0OjMgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICA0ODB4NDgwIDE2OjkgZnJhbWUgd2l0aCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDcpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgyMCAvIDExKSkpLFxuICAvKlxuICAgIDMyOjExXG4gICAzNTJ4NTc2IDE2OjkgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDgpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgzMiAvIDExKSkpLFxuICAvKlxuICAgIDgwOjMzXG4gICAzNTJ4NDgwIDE2OjkgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDkpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCg4MCAvIDMzKSkpLFxuICAvKlxuICAgIDE4OjExXG4gICA0ODB4NTc2IDQ6MyBmcmFtZSB3aXRoIGhvcml6b250YWwgb3ZlcnNjYW5cbiAgICovXG4gIHdoZW4oZXF1YWxzKCdhc3BlY3RfcmF0aW9faWRjJywgMTApLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgxOCAvIDExKSkpLFxuICAvKlxuICAgIDE1OjExXG4gICA0ODB4NDgwIDQ6MyBmcmFtZSB3aXRoIGhvcml6b250YWwgb3ZlcnNjYW5cbiAgICovXG4gIHdoZW4oZXF1YWxzKCdhc3BlY3RfcmF0aW9faWRjJywgMTEpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgxNSAvIDExKSkpLFxuICAvKlxuICAgIDY0OjMzXG4gICA1Mjh4NTc2IDE2OjkgZnJhbWUgd2l0aCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDEyKSxcbiAgICBkYXRhKCdzYW1wbGVfcmF0aW8nLCB2YWwoNjQgLyAzMykpKSxcbiAgLypcbiAgICAxNjA6OTlcbiAgIDUyOHg0ODAgMTY6OSBmcmFtZSB3aXRob3V0IGhvcml6b250YWwgb3ZlcnNjYW5cbiAgICovXG4gIHdoZW4oZXF1YWxzKCdhc3BlY3RfcmF0aW9faWRjJywgMTMpLFxuICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsIHZhbCgxNjAgLyA5OSkpKSxcbiAgLypcbiAgICA0OjNcbiAgIDE0NDB4MTA4MCAxNjo5IGZyYW1lIHdpdGhvdXQgaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgKi9cbiAgd2hlbihlcXVhbHMoJ2FzcGVjdF9yYXRpb19pZGMnLCAxNCksXG4gICAgZGF0YSgnc2FtcGxlX3JhdGlvJywgdmFsKDQgLyAzKSkpLFxuICAvKlxuICAgIDM6MlxuICAgMTI4MHgxMDgwIDE2OjkgZnJhbWUgd2l0aG91dCBob3Jpem9udGFsIG92ZXJzY2FuXG4gICAqL1xuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2lkYycsIDE1KSxcbiAgICBkYXRhKCdzYW1wbGVfcmF0aW8nLCB2YWwoMyAvIDIpKSksXG4gIC8qXG4gICAgMjoxXG4gICA5NjB4MTA4MCAxNjo5IGZyYW1lIHdpdGhvdXQgaG9yaXpvbnRhbCBvdmVyc2NhblxuICAgKi9cbiAgd2hlbihlcXVhbHMoJ2FzcGVjdF9yYXRpb19pZGMnLCAxNiksXG4gICAgZGF0YSgnc2FtcGxlX3JhdGlvJywgdmFsKDIgLyAxKSkpLFxuICAvKiBFeHRlbmRlZF9TQVIgKi9cbiAgd2hlbihlcXVhbHMoJ2FzcGVjdF9yYXRpb19pZGMnLCAyNTUpLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgnc2FyX3dpZHRoJywgdSgxNikpLFxuICAgICAgZGF0YSgnc2FyX2hlaWdodCcsIHUoMTYpKSxcbiAgICAgIGRhdGEoJ3NhbXBsZV9yYXRpbycsXG4gICAgICAgIHZhbCgoZXhwR29sb21iLCBvdXRwdXQsIG9wdGlvbnMpID0+IG91dHB1dC5zYXJfd2lkdGggLyBvdXRwdXQuc2FyX2hlaWdodCkpXG4gICAgXSkpXG5dKTtcblxuY29uc3QgdnVpUGFyYW10ZXJzID0gbGlzdChbXG4gIGRhdGEoJ2FzcGVjdF9yYXRpb19pbmZvX3ByZXNlbnRfZmxhZycsIHUoMSkpLFxuICB3aGVuKGVxdWFscygnYXNwZWN0X3JhdGlvX2luZm9fcHJlc2VudF9mbGFnJywgMSksXG4gICAgbGlzdChbXG4gICAgICBkYXRhKCdhc3BlY3RfcmF0aW9faWRjJywgdSg4KSksXG4gICAgICBzYW1wbGVSYXRpb0NhbGMsXG4gICAgXSkpLFxuICBkYXRhKCdvdmVyc2Nhbl9pbmZvX3ByZXNlbnRfZmxhZycsIHUoMSkpLFxuICB3aGVuKGVxdWFscygnb3ZlcnNjYW5faW5mb19wcmVzZW50X2ZsYWcnLCAxKSxcbiAgICBkYXRhKCdvdmVyc2Nhbl9hcHByb3ByaWF0ZV9mbGFnJywgdSgxKSkpLFxuICBkYXRhKCd2aWRlb19zaWduYWxfdHlwZV9wcmVzZW50X2ZsYWcnLCB1KDEpKSxcbiAgd2hlbihlcXVhbHMoJ3ZpZGVvX3NpZ25hbF90eXBlX3ByZXNlbnRfZmxhZycsIDEpLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgndmlkZW9fZm9ybWF0JywgdSgzKSksXG4gICAgICBkYXRhKCd2aWRlb19mdWxsX3JhbmdlX2ZsYWcnLCB1KDEpKSxcbiAgICAgIGRhdGEoJ2NvbG91cl9kZXNjcmlwdGlvbl9wcmVzZW50X2ZsYWcnLCB1KDEpKSxcbiAgICAgIHdoZW4oZXF1YWxzKCdjb2xvdXJfZGVzY3JpcHRpb25fcHJlc2VudF9mbGFnJywgMSksXG4gICAgICAgIGxpc3QoW1xuICAgICAgICAgIGRhdGEoJ2NvbG91cl9wcmltYXJpZXMnLCB1KDgpKSxcbiAgICAgICAgICBkYXRhKCd0cmFuc2Zlcl9jaGFyYWN0ZXJpc3RpY3MnLCB1KDgpKSxcbiAgICAgICAgICBkYXRhKCdtYXRyaXhfY29lZmZpY2llbnRzJywgdSg4KSlcbiAgICAgICAgXSkpXG4gICAgXSkpLFxuICBkYXRhKCdjaHJvbWFfbG9jX2luZm9fcHJlc2VudF9mbGFnJywgdSgxKSksXG4gIHdoZW4oZXF1YWxzKCdjaHJvbWFfbG9jX2luZm9fcHJlc2VudF9mbGFnJywgMSksXG4gICAgbGlzdChbXG4gICAgICBkYXRhKCdjaHJvbWFfc2FtcGxlX2xvY190eXBlX3RvcF9maWVsZCcsIHVlKHYpKSxcbiAgICAgIGRhdGEoJ2Nocm9tYV9zYW1wbGVfbG9jX3R5cGVfYm90dG9tX2ZpZWxkJywgdWUodikpXG4gICAgXSkpLFxuICBkYXRhKCd0aW1pbmdfaW5mb19wcmVzZW50X2ZsYWcnLCB1KDEpKSxcbiAgd2hlbihlcXVhbHMoJ3RpbWluZ19pbmZvX3ByZXNlbnRfZmxhZycsIDEpLFxuICAgIGxpc3QoW1xuICAgICAgZGF0YSgnbnVtX3VuaXRzX2luX3RpY2snLCB1KDMyKSksXG4gICAgICBkYXRhKCd0aW1lX3NjYWxlJywgdSgzMikpLFxuICAgICAgZGF0YSgnZml4ZWRfZnJhbWVfcmF0ZV9mbGFnJywgdSgxKSlcbiAgICBdKSksXG4gIGRhdGEoJ25hbF9ocmRfcGFyYW1ldGVyc19wcmVzZW50X2ZsYWcnLCB1KDEpKSxcbiAgd2hlbihlcXVhbHMoJ25hbF9ocmRfcGFyYW1ldGVyc19wcmVzZW50X2ZsYWcnLCAxKSwgaGRyUGFyYW1ldGVycyksXG4gIGRhdGEoJ3ZjbF9ocmRfcGFyYW1ldGVyc19wcmVzZW50X2ZsYWcnLCB1KDEpKSxcbiAgd2hlbihlcXVhbHMoJ3ZjbF9ocmRfcGFyYW1ldGVyc19wcmVzZW50X2ZsYWcnLCAxKSwgaGRyUGFyYW1ldGVycyksXG4gIHdoZW4oXG4gICAgc29tZShbXG4gICAgICBlcXVhbHMoJ25hbF9ocmRfcGFyYW1ldGVyc19wcmVzZW50X2ZsYWcnLCAxKSxcbiAgICAgIGVxdWFscygndmNsX2hyZF9wYXJhbWV0ZXJzX3ByZXNlbnRfZmxhZycsIDEpXG4gICAgXSksXG4gICAgZGF0YSgnbG93X2RlbGF5X2hyZF9mbGFnJywgdSgxKSkpLFxuICBkYXRhKCdwaWNfc3RydWN0X3ByZXNlbnRfZmxhZycsIHUoMSkpLFxuICBkYXRhKCdiaXRzdHJlYW1fcmVzdHJpY3Rpb25fZmxhZycsIHUoMSkpLFxuICB3aGVuKGVxdWFscygnYml0c3RyZWFtX3Jlc3RyaWN0aW9uX2ZsYWcnLCAxKSxcbiAgICBsaXN0KFtcbiAgICAgIGRhdGEoJ21vdGlvbl92ZWN0b3JzX292ZXJfcGljX2JvdW5kYXJpZXNfZmxhZycsIHUoMSkpLFxuICAgICAgZGF0YSgnbWF4X2J5dGVzX3Blcl9waWNfZGVub20nLCB1ZSh2KSksXG4gICAgICBkYXRhKCdtYXhfYml0c19wZXJfbWJfZGVub20nLCB1ZSh2KSksXG4gICAgICBkYXRhKCdsb2cyX21heF9tdl9sZW5ndGhfaG9yaXpvbnRhbCcsIHVlKHYpKSxcbiAgICAgIGRhdGEoJ2xvZzJfbWF4X212X2xlbmd0aF92ZXJ0aWNhbCcsIHVlKHYpKSxcbiAgICAgIGRhdGEoJ21heF9udW1fcmVvcmRlcl9mcmFtZXMnLCB1ZSh2KSksXG4gICAgICBkYXRhKCdtYXhfZGVjX2ZyYW1lX2J1ZmZlcmluZycsIHVlKHYpKVxuICAgIF0pKVxuXSk7XG5cbmV4cG9ydCBkZWZhdWx0IHZ1aVBhcmFtdGVycztcbiIsImltcG9ydCBoMjY0Q29kZWNzIGZyb20gJy4vYml0LXN0cmVhbXMvaDI2NCc7XG5cbmltcG9ydCB7dHNJbnNwZWN0b3IsIG1wNEluc3BlY3RvciwgZmx2SW5zcGVjdG9yfSBmcm9tICcuL2luc3BlY3RvcnMnO1xuXG5jb25zdCB0aHVtYkNvaWwgPSB7XG4gIGgyNjRDb2RlY3MsXG4gIG1wNEluc3BlY3RvcixcbiAgdHNJbnNwZWN0b3IsXG4gIGZsdkluc3BlY3RvclxufTtcblxuLy8gSW5jbHVkZSB0aGUgdmVyc2lvbiBudW1iZXIuXG50aHVtYkNvaWwuVkVSU0lPTiA9ICdfX1ZFUlNJT05fXyc7XG5cbmV4cG9ydCBkZWZhdWx0IHRodW1iQ29pbDtcbiIsImNvbnN0IGRhdGFUb0hleCA9IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZW50KSB7XG4gIC8vIHByaW50IG91dCByYXcgYnl0ZXMgYXMgaGV4YWRlbWljYWxcbiAgdmFyIGJ5dGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobmV3IFVpbnQ4QXJyYXkodmFsdWUuYnVmZmVyLCB2YWx1ZS5ieXRlT2Zmc2V0LCB2YWx1ZS5ieXRlTGVuZ3RoKSlcbiAgICAgIC5tYXAoYnl0ZSA9PiAoJzAwJyArIGJ5dGUudG9TdHJpbmcoMTYpKS5zbGljZSgtMikpXG4gICAgICAucmVkdWNlKGdyb3VwQnkoOCksIFtdKVxuICAgICAgLm1hcChhID0+IGEuam9pbignICcpKVxuICAgICAgLnJlZHVjZShncm91cEJ5KDIpLCBbXSlcbiAgICAgIC5tYXAoYSA9PiBhLmpvaW4oJyAgJykpXG4gICAgICAuam9pbignJylcbiAgICAgIC5tYXRjaCgvLnsxLDQ4fS9nKTtcblxuICBpZiAoIWJ5dGVzKSB7XG4gICAgcmV0dXJuICc8Pic7XG4gIH1cblxuICBpZiAoYnl0ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGJ5dGVzLmpvaW4oJycpLnNsaWNlKDEpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzLm1hcChmdW5jdGlvbiAobGluZSkge1xuICAgIHJldHVybiBpbmRlbnQgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcbn1cblxuY29uc3QgZ3JvdXBCeSA9IGZ1bmN0aW9uIChjb3VudCkge1xuICByZXR1cm4gKHAsIGMpID0+IHtcbiAgICBsZXQgbGFzdCA9IHAucG9wKCk7XG5cbiAgICBpZiAoIWxhc3QpIHtcbiAgICAgIGxhc3QgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGxhc3QubGVuZ3RoID09PSBjb3VudCkge1xuICAgICAgcC5wdXNoKGxhc3QpO1xuICAgICAgbGFzdCA9IFtdO1xuICAgIH1cbiAgICBsYXN0LnB1c2goYyk7XG4gICAgcC5wdXNoKGxhc3QpO1xuICAgIHJldHVybiBwO1xuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGF0YVRvSGV4O1xuIiwiaW1wb3J0IHtcbiAgZGlzY2FyZEVtdWxhdGlvblByZXZlbnRpb24sXG4gIHBpY1BhcmFtZXRlclNldCxcbiAgc2VxUGFyYW1ldGVyU2V0LFxuICBzbGljZUxheWVyV2l0aG91dFBhcnRpdGlvbmluZyxcbiAgYWNjZXNzVW5pdERlbGltaXRlclxufSBmcm9tICcuLi8uLi9iaXQtc3RyZWFtcy9oMjY0JztcblxubGV0IGxhc3RTUFM7XG5sZXQgbGFzdFBQUztcbmxldCBsYXN0T3B0aW9ucztcblxuZXhwb3J0IGNvbnN0IG1lcmdlUFMgPSBmdW5jdGlvbiAoYSwgYikge1xuICB2YXIgbmV3T2JqID0ge307XG5cbiAgaWYgKGEpIHtcbiAgICBPYmplY3Qua2V5cyhhKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG5ld09ialtrZXldID0gYVtrZXldO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGIpIHtcbiAgICBPYmplY3Qua2V5cyhiKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG5ld09ialtrZXldID0gYltrZXldO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ld09iajtcbn07XG5cbmV4cG9ydCBjb25zdCBuYWxQYXJzZUFWQ0MgPSBmdW5jdGlvbiAoYXZjU3RyZWFtKSB7XG4gIHZhclxuICAgIGF2Y1ZpZXcgPSBuZXcgRGF0YVZpZXcoYXZjU3RyZWFtLmJ1ZmZlciwgYXZjU3RyZWFtLmJ5dGVPZmZzZXQsIGF2Y1N0cmVhbS5ieXRlTGVuZ3RoKSxcbiAgICByZXN1bHQgPSBbXSxcbiAgICBuYWxEYXRhLFxuICAgIGksXG4gICAgbGVuZ3RoO1xuXG4gIGZvciAoaSA9IDA7IGkgKyA0IDwgYXZjU3RyZWFtLmxlbmd0aDsgaSArPSBsZW5ndGgpIHtcbiAgICBsZW5ndGggPSBhdmNWaWV3LmdldFVpbnQzMihpKTtcbiAgICBpICs9IDQ7XG5cbiAgICAvLyBiYWlsIGlmIHRoaXMgZG9lc24ndCBhcHBlYXIgdG8gYmUgYW4gSDI2NCBzdHJlYW1cbiAgICBpZiAobGVuZ3RoIDw9IDApIHtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgdHlwZTogJ01BTEZPUk1FRC1EQVRBJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGxlbmd0aCA+IGF2Y1N0cmVhbS5sZW5ndGgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgdHlwZTogJ1VOS05PV04gTURBVCBEQVRBJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG5hbFVuaXQgPSBhdmNTdHJlYW0uc3ViYXJyYXkoaSwgaSArIGxlbmd0aCk7XG5cbiAgICByZXN1bHQucHVzaChuYWxQYXJzZShuYWxVbml0KSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IG5hbFBhcnNlQW5uZXhCID0gZnVuY3Rpb24gKGJ1ZmZlcikge1xuICBsZXQgc3luY1BvaW50ID0gMDtcbiAgbGV0IGk7XG4gIGxldCByZXN1bHQgPSBbXTtcblxuICAvLyBSZWMuIElUVS1UIEguMjY0LCBBbm5leCBCXG4gIC8vIHNjYW4gZm9yIE5BTCB1bml0IGJvdW5kYXJpZXNcblxuICAvLyBhIG1hdGNoIGxvb2tzIGxpa2UgdGhpczpcbiAgLy8gMCAwIDEgLi4gTkFMIC4uIDAgMCAxXG4gIC8vIF4gc3luYyBwb2ludCAgICAgICAgXiBpXG4gIC8vIG9yIHRoaXM6XG4gIC8vIDAgMCAxIC4uIE5BTCAuLiAwIDAgMFxuICAvLyBeIHN5bmMgcG9pbnQgICAgICAgIF4gaVxuXG4gIC8vIGFkdmFuY2UgdGhlIHN5bmMgcG9pbnQgdG8gYSBOQUwgc3RhcnQsIGlmIG5lY2Vzc2FyeVxuICBmb3IgKDsgc3luY1BvaW50IDwgYnVmZmVyLmJ5dGVMZW5ndGggLSAzOyBzeW5jUG9pbnQrKykge1xuICAgIGlmIChidWZmZXJbc3luY1BvaW50XSA9PT0gMCAmJlxuICAgICAgYnVmZmVyW3N5bmNQb2ludCArIDFdID09PSAwICYmXG4gICAgICBidWZmZXJbc3luY1BvaW50ICsgMl0gPT09IDEpIHtcbiAgICAgIC8vIHRoZSBzeW5jIHBvaW50IGlzIHByb3Blcmx5IGFsaWduZWRcbiAgICAgIGkgPSBzeW5jUG9pbnQgKyA1O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKGkgPCBidWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgIGlmIChzeW5jUG9pbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVidWdnZXI7XG4gICAgfVxuICAgIC8vIGxvb2sgYXQgdGhlIGN1cnJlbnQgYnl0ZSB0byBkZXRlcm1pbmUgaWYgd2UndmUgaGl0IHRoZSBlbmQgb2ZcbiAgICAvLyBhIE5BTCB1bml0IGJvdW5kYXJ5XG4gICAgc3dpdGNoIChidWZmZXJbaV0pIHtcbiAgICBjYXNlIDA6XG4gICAgICAvLyBza2lwIHBhc3Qgbm9uLXN5bmMgc2VxdWVuY2VzXG4gICAgICBpZiAoYnVmZmVyW2kgLSAxXSAhPT0gMCkge1xuICAgICAgICBpICs9IDI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmIChidWZmZXJbaSAtIDJdICE9PSAwKSB7XG4gICAgICAgIGkrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlbGl2ZXIgdGhlIE5BTCB1bml0IGlmIGl0IGlzbid0IGVtcHR5XG4gICAgICBpZiAoc3luY1BvaW50ICsgMyAhPT0gaSAtIDIpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobmFsUGFyc2UoYnVmZmVyLnN1YmFycmF5KHN5bmNQb2ludCArIDMsIGkgLSAyKSkpO1xuICAgICAgfVxuXG4gICAgICAvLyBkcm9wIHRyYWlsaW5nIHplcm9lc1xuICAgICAgZG8ge1xuICAgICAgICBpKys7XG4gICAgICB9IHdoaWxlIChidWZmZXJbaV0gIT09IDEgJiYgaSA8IGJ1ZmZlci5sZW5ndGgpO1xuICAgICAgc3luY1BvaW50ID0gaSAtIDI7XG4gICAgICBpICs9IDM7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE6XG4gICAgICAvLyBza2lwIHBhc3Qgbm9uLXN5bmMgc2VxdWVuY2VzXG4gICAgICBpZiAoYnVmZmVyW2kgLSAxXSAhPT0gMCB8fFxuICAgICAgICAgIGJ1ZmZlcltpIC0gMl0gIT09IDApIHtcbiAgICAgICAgaSArPSAzO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gZGVsaXZlciB0aGUgTkFMIHVuaXRcbiAgICAgIHJlc3VsdC5wdXNoKG5hbFBhcnNlKGJ1ZmZlci5zdWJhcnJheShzeW5jUG9pbnQgKyAzLCBpIC0gMikpKTtcbiAgICAgIHN5bmNQb2ludCA9IGkgLSAyO1xuICAgICAgaSArPSAzO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIHRoZSBjdXJyZW50IGJ5dGUgaXNuJ3QgYSBvbmUgb3IgemVybywgc28gaXQgY2Fubm90IGJlIHBhcnRcbiAgICAgIC8vIG9mIGEgc3luYyBzZXF1ZW5jZVxuICAgICAgaSArPSAzO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIC8vIGZpbHRlciBvdXQgdGhlIE5BTCB1bml0cyB0aGF0IHdlcmUgZGVsaXZlcmVkXG4gIGJ1ZmZlciA9IGJ1ZmZlci5zdWJhcnJheShzeW5jUG9pbnQpO1xuICBpIC09IHN5bmNQb2ludDtcbiAgc3luY1BvaW50ID0gMDtcblxuICAvLyBkZWxpdmVyIHRoZSBsYXN0IGJ1ZmZlcmVkIE5BTCB1bml0XG4gIGlmIChidWZmZXIgJiYgYnVmZmVyLmJ5dGVMZW5ndGggPiAzKSB7XG4gICAgcmVzdWx0LnB1c2gobmFsUGFyc2UoYnVmZmVyLnN1YmFycmF5KHN5bmNQb2ludCArIDMpKSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuY29uc3QgbmFsUGFyc2UgPSBmdW5jdGlvbiAobmFsVW5pdCkge1xuICBsZXQgbmFsRGF0YTtcblxuICBpZiAobmFsVW5pdC5sZW5ndGggPiAxKSB7XG4gICAgbmFsRGF0YSA9IGRpc2NhcmRFbXVsYXRpb25QcmV2ZW50aW9uKG5hbFVuaXQuc3ViYXJyYXkoMSkpO1xuICB9IGVsc2Uge1xuICAgIG5hbERhdGEgPSBuYWxVbml0O1xuICB9XG5cbiAgbGV0IG5hbFVuaXRUeXBlID0gKG5hbFVuaXRbMF0gJiAweDFGKTtcbiAgbGV0IG5hbFJlZklkYyA9IChuYWxVbml0WzBdICYgMHg2MCkgPj4+IDU7XG5cbiAgaWYgKGxhc3RPcHRpb25zKSB7XG4gICAgbGFzdE9wdGlvbnMubmFsX3VuaXRfdHlwZSA9IG5hbFVuaXRUeXBlO1xuICAgIGxhc3RPcHRpb25zLm5hbF9yZWZfaWRjID0gbmFsUmVmSWRjO1xuICB9XG4gIGxldCBuYWxPYmplY3Q7XG4gIGxldCBuZXdPcHRpb25zO1xuXG4gIHN3aXRjaCAobmFsVW5pdFR5cGUpIHtcbiAgICBjYXNlIDB4MDE6XG4gICAgICBuYWxPYmplY3QgPSBzbGljZUxheWVyV2l0aG91dFBhcnRpdGlvbmluZy5kZWNvZGUobmFsRGF0YSwgbGFzdE9wdGlvbnMpO1xuICAgICAgbmFsT2JqZWN0LnR5cGUgPSAnc2xpY2VfbGF5ZXJfd2l0aG91dF9wYXJ0aXRpb25pbmdfcmJzcCc7XG4gICAgICBuYWxPYmplY3QubmFsX3JlZl9pZGMgPSBuYWxSZWZJZGM7XG4gICAgICBuYWxPYmplY3Quc2l6ZSA9IG5hbERhdGEubGVuZ3RoO1xuICAgICAgcmV0dXJuIG5hbE9iamVjdDtcbiAgICBjYXNlIDB4MDI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc2xpY2VfZGF0YV9wYXJ0aXRpb25fYV9sYXllcl9yYnNwJyxcbiAgICAgICAgc2l6ZTogbmFsRGF0YS5sZW5ndGhcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBjYXNlIDB4MDM6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc2xpY2VfZGF0YV9wYXJ0aXRpb25fYl9sYXllcl9yYnNwJyxcbiAgICAgICAgc2l6ZTogbmFsRGF0YS5sZW5ndGhcbiAgICAgIH07XG4gICAgY2FzZSAweDA0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NsaWNlX2RhdGFfcGFydGl0aW9uX2NfbGF5ZXJfcmJzcCcsXG4gICAgICAgIHNpemU6IG5hbERhdGEubGVuZ3RoXG4gICAgICB9O1xuICAgIGNhc2UgMHgwNTpcbiAgICAgIG5ld09wdGlvbnMgPSBtZXJnZVBTKGxhc3RPcHRpb25zLCB7aWRyUGljRmxhZzogMX0pO1xuICAgICAgbmFsT2JqZWN0ID0gc2xpY2VMYXllcldpdGhvdXRQYXJ0aXRpb25pbmcuZGVjb2RlKG5hbERhdGEsIG5ld09wdGlvbnMpO1xuICAgICAgbmFsT2JqZWN0LnR5cGUgPSAnc2xpY2VfbGF5ZXJfd2l0aG91dF9wYXJ0aXRpb25pbmdfcmJzcF9pZHInO1xuICAgICAgbmFsT2JqZWN0Lm5hbF9yZWZfaWRjID0gbmFsUmVmSWRjO1xuICAgICAgbmFsT2JqZWN0LnNpemUgPSBuYWxEYXRhLmxlbmd0aDtcbiAgICAgIHJldHVybiBuYWxPYmplY3Q7XG4gICAgY2FzZSAweDA2OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NlaV9yYnNwJyxcbiAgICAgICAgc2l6ZTogbmFsRGF0YS5sZW5ndGhcbiAgICAgIH07XG4gICAgY2FzZSAweDA3OlxuICAgICAgbGFzdFNQUyA9IHNlcVBhcmFtZXRlclNldC5kZWNvZGUobmFsRGF0YSk7XG4gICAgICBsYXN0T3B0aW9ucyA9IG1lcmdlUFMobGFzdFBQUywgbGFzdFNQUyk7XG4gICAgICBsYXN0U1BTLnR5cGUgPSAnc2VxX3BhcmFtZXRlcl9zZXRfcmJzcCc7XG4gICAgICBsYXN0U1BTLnNpemUgPSBuYWxEYXRhLmxlbmd0aDtcbiAgICAgIHJldHVybiBsYXN0U1BTO1xuICAgIGNhc2UgMHgwODpcbiAgICAgIGxhc3RQUFMgPSBwaWNQYXJhbWV0ZXJTZXQuZGVjb2RlKG5hbERhdGEpO1xuICAgICAgbGFzdE9wdGlvbnMgPSBtZXJnZVBTKGxhc3RQUFMsIGxhc3RTUFMpO1xuICAgICAgbGFzdFBQUy50eXBlID0gJ3BpY19wYXJhbWV0ZXJfc2V0X3Jic3AnO1xuICAgICAgbGFzdFBQUy5zaXplID0gbmFsRGF0YS5sZW5ndGg7XG4gICAgICByZXR1cm4gbGFzdFBQUztcbiAgICBjYXNlIDB4MDk6XG4gICAgICBuYWxPYmplY3QgPSBhY2Nlc3NVbml0RGVsaW1pdGVyLmRlY29kZShuYWxEYXRhKTtcbiAgICAgIG5hbE9iamVjdC50eXBlID0gJ2FjY2Vzc191bml0X2RlbGltaXRlcl9yYnNwJztcbiAgICAgIG5hbE9iamVjdC5zaXplID0gbmFsRGF0YS5sZW5ndGg7XG4gICAgICByZXR1cm4gbmFsT2JqZWN0O1xuICAgIGNhc2UgMHgwQTpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdlbmRfb2Zfc2VxX3Jic3AnLFxuICAgICAgICBzaXplOiBuYWxEYXRhLmxlbmd0aFxuICAgICAgfTtcbiAgICBjYXNlIDB4MEI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZW5kX29mX3N0cmVhbV9yYnNwJyxcbiAgICAgICAgc2l6ZTogbmFsRGF0YS5sZW5ndGhcbiAgICAgIH07XG4gICAgY2FzZSAweDBDOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ZpbGxlcl9kYXRhX3Jic3AnLFxuICAgICAgICBzaXplOiBuYWxEYXRhLmxlbmd0aFxuICAgICAgfTtcbiAgICBjYXNlIDB4MEQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc2VxX3BhcmFtZXRlcl9zZXRfZXh0ZW5zaW9uX3Jic3AnLFxuICAgICAgICBzaXplOiBuYWxEYXRhLmxlbmd0aFxuICAgICAgfTtcbiAgICBjYXNlIDB4MEU6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncHJlZml4X25hbF91bml0X3Jic3AnLFxuICAgICAgICBzaXplOiBuYWxEYXRhLmxlbmd0aFxuICAgICAgfTtcbiAgICBjYXNlIDB4MEY6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc3Vic2V0X3NlcV9wYXJhbWV0ZXJfc2V0X3Jic3AnLFxuICAgICAgICBzaXplOiBuYWxEYXRhLmxlbmd0aFxuICAgICAgfTtcbiAgICBjYXNlIDB4MTA6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZGVwdGhfcGFyYW1ldGVyX3NldF9yYnNwJyxcbiAgICAgICAgc2l6ZTogbmFsRGF0YS5sZW5ndGhcbiAgICAgIH07XG4gICAgY2FzZSAweDEzOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NsaWNlX2xheWVyX3dpdGhvdXRfcGFydGl0aW9uaW5nX3Jic3BfYXV4JyxcbiAgICAgICAgc2l6ZTogbmFsRGF0YS5sZW5ndGhcbiAgICAgIH07XG4gICAgY2FzZSAweDE0OlxuICAgIGNhc2UgMHgxNTpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzbGljZV9sYXllcl9leHRlbnNpb25fcmJzcCcsXG4gICAgICAgIHNpemU6IG5hbERhdGEubGVuZ3RoXG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnSU5WQUxJRCBOQUwtVU5JVC1UWVBFIC0gJyArIG5hbFVuaXRUeXBlLFxuICAgICAgICBzaXplOiBuYWxEYXRhLmxlbmd0aFxuICAgICAgfTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtuYWxQYXJzZUFWQ0MsIG1lcmdlUFN9IGZyb20gJy4vY29tbW9uL25hbC1wYXJzZSc7XG5pbXBvcnQgZGF0YVRvSGV4IGZyb20gJy4vY29tbW9uL2RhdGEtdG8taGV4LmpzJztcblxudmFyXG4gIHRhZ1R5cGVzID0ge1xuICAgIDB4MDg6ICdhdWRpbycsXG4gICAgMHgwOTogJ3ZpZGVvJyxcbiAgICAweDEyOiAnbWV0YWRhdGEnXG4gIH0sXG4gIGhleCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAnMHgnICsgKCcwMCcgKyB2YWwudG9TdHJpbmcoMTYpKS5zbGljZSgtMikudG9VcHBlckNhc2UoKTtcbiAgfSxcbiAgaGV4U3RyaW5nTGlzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgYXJyID0gW10sIGk7XG5cbiAgICB3aGlsZSAoZGF0YS5ieXRlTGVuZ3RoID4gMCkge1xuICAgICAgaSA9IDA7XG4gICAgICBhcnIucHVzaChoZXgoZGF0YVtpKytdKSk7XG4gICAgICBkYXRhID0gZGF0YS5zdWJhcnJheShpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyci5qb2luKCcgJyk7XG4gIH0sXG4gIHBhcnNlQVZDVGFnID0gZnVuY3Rpb24odGFnLCBvYmopIHtcbiAgICB2YXJcbiAgICAgIGF2Y1BhY2tldFR5cGVzID0gW1xuICAgICAgICAnQVZDIFNlcXVlbmNlIEhlYWRlcicsXG4gICAgICAgICdBVkMgTkFMVScsXG4gICAgICAgICdBVkMgRW5kLW9mLVNlcXVlbmNlJ1xuICAgICAgXSxcbiAgICAgIGNvbXBvc2l0aW9uVGltZSA9ICh0YWdbMV0gJiBwYXJzZUludCgnMDExMTExMTEnLCAyKSA8PCAxNikgfCAodGFnWzJdIDw8IDgpIHwgdGFnWzNdO1xuXG4gICAgb2JqID0gb2JqIHx8IHt9O1xuXG4gICAgb2JqLmF2Y1BhY2tldFR5cGUgPSBhdmNQYWNrZXRUeXBlc1t0YWdbMF1dO1xuICAgIG9iai5Db21wb3NpdGlvblRpbWUgPSAodGFnWzFdICYgcGFyc2VJbnQoJzEwMDAwMDAwJywgMikpID8gLWNvbXBvc2l0aW9uVGltZSA6IGNvbXBvc2l0aW9uVGltZTtcblxuICAgIG9iai5kYXRhID0gdGFnLnN1YmFycmF5KDQpO1xuICAgIGlmICh0YWdbMF0gPT09IDApIHtcbiAgICAgIG9iai50eXBlID0gJ3ZpZGVvLW1ldGFkYXRhJztcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICBwYXJzZVZpZGVvVGFnID0gZnVuY3Rpb24odGFnLCBvYmopIHtcbiAgICB2YXJcbiAgICAgIGZyYW1lVHlwZXMgPSBbXG4gICAgICAgICdVbmtub3duJyxcbiAgICAgICAgJ0tleWZyYW1lIChmb3IgQVZDLCBhIHNlZWthYmxlIGZyYW1lKScsXG4gICAgICAgICdJbnRlciBmcmFtZSAoZm9yIEFWQywgYSBub25zZWVrYWJsZSBmcmFtZSknLFxuICAgICAgICAnRGlzcG9zYWJsZSBpbnRlciBmcmFtZSAoSC4yNjMgb25seSknLFxuICAgICAgICAnR2VuZXJhdGVkIGtleWZyYW1lIChyZXNlcnZlZCBmb3Igc2VydmVyIHVzZSBvbmx5KScsXG4gICAgICAgICdWaWRlbyBpbmZvL2NvbW1hbmQgZnJhbWUnXG4gICAgICBdLFxuICAgICAgY29kZWNJRCA9IHRhZ1swXSAmIHBhcnNlSW50KCcwMDAwMTExMScsIDIpO1xuXG4gICAgb2JqID0gb2JqIHx8IHt9O1xuXG4gICAgb2JqLmZyYW1lVHlwZSA9IGZyYW1lVHlwZXNbKHRhZ1swXSAmIHBhcnNlSW50KCcxMTExMDAwMCcsIDIpKSA+Pj4gNF07XG4gICAgb2JqLmNvZGVjSUQgPSBjb2RlY0lEO1xuXG4gICAgaWYgKGNvZGVjSUQgPT09IDcpIHtcbiAgICAgIHJldHVybiBwYXJzZUFWQ1RhZyh0YWcuc3ViYXJyYXkoMSksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gIHBhcnNlQUFDVGFnID0gZnVuY3Rpb24odGFnLCBvYmopIHtcbiAgICB2YXIgcGFja2V0VHlwZXMgPSBbXG4gICAgICAnQUFDIFNlcXVlbmNlIEhlYWRlcicsXG4gICAgICAnQUFDIFJhdydcbiAgICBdO1xuXG4gICAgb2JqID0gb2JqIHx8IHt9O1xuXG4gICAgb2JqLmFhY1BhY2tldFR5cGUgPSBwYWNrZXRUeXBlc1t0YWdbMF1dO1xuICAgIG9iai5kYXRhID0gdGFnLnN1YmFycmF5KDEpO1xuXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgcGFyc2VBdWRpb1RhZyA9IGZ1bmN0aW9uKHRhZywgb2JqKSB7XG4gICAgdmFyXG4gICAgICBmb3JtYXRUYWJsZSA9IFtcbiAgICAgICAgJ0xpbmVhciBQQ00sIHBsYXRmb3JtIGVuZGlhbicsXG4gICAgICAgICdBRFBDTScsXG4gICAgICAgICdNUDMnLFxuICAgICAgICAnTGluZWFyIFBDTSwgbGl0dGxlIGVuZGlhbicsXG4gICAgICAgICdOZWxseW1vc2VyIDE2LWtIeiBtb25vJyxcbiAgICAgICAgJ05lbGx5bW9zZXIgOC1rSHogbW9ubycsXG4gICAgICAgICdOZWxseW1vc2VyJyxcbiAgICAgICAgJ0cuNzExIEEtbGF3IGxvZ2FyaXRobWljIFBDTScsXG4gICAgICAgICdHLjcxMSBtdS1sYXcgbG9nYXJpdGhtaWMgUENNJyxcbiAgICAgICAgJ3Jlc2VydmVkJyxcbiAgICAgICAgJ0FBQycsXG4gICAgICAgICdTcGVleCcsXG4gICAgICAgICdNUDMgOC1LaHonLFxuICAgICAgICAnRGV2aWNlLXNwZWNpZmljIHNvdW5kJ1xuICAgICAgXSxcbiAgICAgIHNhbXBsaW5nUmF0ZVRhYmxlID0gW1xuICAgICAgICAnNS41LWtIeicsXG4gICAgICAgICcxMS1rSHonLFxuICAgICAgICAnMjIta0h6JyxcbiAgICAgICAgJzQ0LWtIeidcbiAgICAgIF0sXG4gICAgICBzb3VuZEZvcm1hdCA9ICh0YWdbMF0gJiBwYXJzZUludCgnMTExMTAwMDAnLCAyKSkgPj4+IDQ7XG5cbiAgICBvYmogPSBvYmogfHwge307XG5cbiAgICBvYmouc291bmRGb3JtYXQgPSBmb3JtYXRUYWJsZVtzb3VuZEZvcm1hdF07XG4gICAgb2JqLnNvdW5kUmF0ZSA9IHNhbXBsaW5nUmF0ZVRhYmxlWyh0YWdbMF0gJiBwYXJzZUludCgnMDAwMDExMDAnLCAyKSkgPj4+IDJdO1xuICAgIG9iai5zb3VuZFNpemUgPSAoKHRhZ1swXSAmIHBhcnNlSW50KCcwMDAwMDAxMCcsIDIpKSA+Pj4gMSkgPyAnMTYtYml0JyA6ICc4LWJpdCc7XG4gICAgb2JqLnNvdW5kVHlwZSA9ICh0YWdbMF0gJiBwYXJzZUludCgnMDAwMDAwMDEnLCAyKSkgPyAnU3RlcmVvJyA6ICdNb25vJztcblxuICAgIGlmIChzb3VuZEZvcm1hdCA9PT0gMTApIHtcbiAgICAgIHJldHVybiBwYXJzZUFBQ1RhZyh0YWcuc3ViYXJyYXkoMSksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gIHBhcnNlR2VuZXJpY1RhZyA9IGZ1bmN0aW9uKHRhZykge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0YWdUeXBlc1t0YWdbMF1dLFxuICAgICAgZGF0YVNpemU6ICh0YWdbMV0gPDwgMTYpIHwgKHRhZ1syXSA8PCA4KSB8IHRhZ1szXSxcbiAgICAgIHRpbWVzdGFtcDogKHRhZ1s3XSA8PCAyNCkgfCAodGFnWzRdIDw8IDE2KSB8ICh0YWdbNV0gPDwgOCkgfCB0YWdbNl0sXG4gICAgICBzdHJlYW1JRDogKHRhZ1s4XSA8PCAxNikgfCAodGFnWzldIDw8IDgpIHwgdGFnWzEwXVxuICAgIH07XG4gIH0sXG4gIGluc3BlY3RGbHZUYWcgPSBmdW5jdGlvbih0YWcpIHtcbiAgICB2YXIgaGVhZGVyID0gcGFyc2VHZW5lcmljVGFnKHRhZyk7XG4gICAgc3dpdGNoICh0YWdbMF0pIHtcbiAgICAgIGNhc2UgMHgwODpcbiAgICAgICAgcGFyc2VBdWRpb1RhZyh0YWcuc3ViYXJyYXkoMTEpLCBoZWFkZXIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgcGFyc2VWaWRlb1RhZyh0YWcuc3ViYXJyYXkoMTEpLCBoZWFkZXIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHgxMjpcbiAgICB9XG4gICAgcmV0dXJuIGhlYWRlcjtcbiAgfSxcbiAgaW5zcGVjdEZsdiA9IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgdmFyIGkgPSA5LCAvLyBoZWFkZXJcbiAgICAgICAgZGF0YVNpemUsXG4gICAgICAgIHBhcnNlZFJlc3VsdHMgPSBbXSxcbiAgICAgICAgdGFnO1xuXG4gICAgLy8gdHJhdmVyc2UgdGhlIHRhZ3NcbiAgICBpICs9IDQ7IC8vIHNraXAgcHJldmlvdXMgdGFnIHNpemVcbiAgICB3aGlsZSAoaSA8IGJ5dGVzLmJ5dGVMZW5ndGgpIHtcbiAgICAgIGRhdGFTaXplID0gYnl0ZXNbaSArIDFdIDw8IDE2O1xuICAgICAgZGF0YVNpemUgfD0gYnl0ZXNbaSArIDJdIDw8IDg7XG4gICAgICBkYXRhU2l6ZSB8PSBieXRlc1tpICsgM107XG4gICAgICBkYXRhU2l6ZSArPSAxMTtcblxuICAgICAgdGFnID0gYnl0ZXMuc3ViYXJyYXkoaSwgaSArIGRhdGFTaXplKTtcbiAgICAgIHBhcnNlZFJlc3VsdHMucHVzaChpbnNwZWN0Rmx2VGFnKHRhZykpO1xuICAgICAgaSArPSBkYXRhU2l6ZSArIDQ7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRSZXN1bHRzO1xuICB9O1xuXG5jb25zdCBkb21pZnlGbHYgPSBmdW5jdGlvbiAoZmx2VGFncykge1xuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgcGFyc2VQRVNQYWNrZXRzKGZsdlRhZ3MsIGNvbnRhaW5lciwgMSk7XG5cbiAgcmV0dXJuIGNvbnRhaW5lcjtcbn07XG5cbmNvbnN0IHBhcnNlUEVTUGFja2V0cyA9IGZ1bmN0aW9uIChwZXNQYWNrZXRzLCBwYXJlbnQsIGRlcHRoKSB7XG4gIHBlc1BhY2tldHMuZm9yRWFjaCgocGFja2V0KSA9PiB7XG4gICAgdmFyIHBhY2tldEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZG9taWZ5Qm94KHBhcnNlTmFscyhwYWNrZXQpLCBwYXJlbnQsIGRlcHRoICsgMSk7XG4gIH0pO1xufTtcblxuY29uc3QgcGFyc2VOYWxzID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICBpZiAocGFja2V0LnR5cGUgPT09ICd2aWRlbycpIHtcbiAgICBwYWNrZXQubmFscyA9IG5hbFBhcnNlQVZDQyhwYWNrZXQuZGF0YSk7XG4gIH1cbiAgcmV0dXJuIHBhY2tldDtcbn07XG5cbmNvbnN0IGRvbWlmeUJveCA9IGZ1bmN0aW9uIChib3gsIHBhcmVudE5vZGUsIGRlcHRoKSB7XG4gIHZhciBpc09iamVjdCA9IChvKSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnc2l6ZScsICdmbGFncycsICd0eXBlJywgJ3ZlcnNpb24nXTtcbiAgdmFyIHNwZWNpYWxQcm9wZXJ0aWVzID0gWydib3hlcycsICduYWxzJywgJ3NhbXBsZXMnLCAncGFja2V0Q291bnQnXTtcbiAgdmFyIG9iamVjdFByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhib3gpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGJveFtrZXldKSB8fFxuICAgICAgKEFycmF5LmlzQXJyYXkoYm94W2tleV0pICYmIGlzT2JqZWN0KGJveFtrZXldWzBdKSk7XG4gIH0pO1xuICB2YXIgcHJvcGVydHlFeGNsdXNpb25zID1cbiAgICBhdHRyaWJ1dGVzXG4gICAgICAuY29uY2F0KHNwZWNpYWxQcm9wZXJ0aWVzKVxuICAgICAgLmNvbmNhdChvYmplY3RQcm9wZXJ0aWVzKTtcbiAgdmFyIHN1YlByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhib3gpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIHByb3BlcnR5RXhjbHVzaW9ucy5pbmRleE9mKGtleSkgPT09IC0xO1xuICB9KTtcblxuICB2YXIgYm94Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21wNC1ib3gnKTtcbiAgdmFyIHByb3BlcnR5Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21wNC1wcm9wZXJ0aWVzJyk7XG4gIHZhciBzdWJCb3hlc05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtYm94ZXMnKTtcbiAgdmFyIGJveFR5cGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbXA0LWJveC10eXBlJyk7XG5cbiAgaWYgKGJveC50eXBlKSB7XG4gICAgYm94VHlwZU5vZGUudGV4dENvbnRlbnQgPSBib3gudHlwZTtcblxuICAgIGlmIChkZXB0aCA+IDEpIHtcbiAgICAgIGJveFR5cGVOb2RlLmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICAgIH1cblxuICAgIGJveE5vZGUuYXBwZW5kQ2hpbGQoYm94VHlwZU5vZGUpO1xuICB9XG5cbiAgYXR0cmlidXRlcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAodHlwZW9mIGJveFtrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgYm94Tm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGtleSwgYm94W2tleV0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHN1YlByb3BlcnRpZXMubGVuZ3RoKSB7XG4gICAgc3ViUHJvcGVydGllcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIG1ha2VQcm9wZXJ0eShrZXksIGJveFtrZXldLCBwcm9wZXJ0eU5vZGUpO1xuICAgIH0pO1xuICAgIGJveE5vZGUuYXBwZW5kQ2hpbGQocHJvcGVydHlOb2RlKTtcbiAgfVxuXG4gIGlmIChib3guYm94ZXMgJiYgYm94LmJveGVzLmxlbmd0aCkge1xuICAgIGJveC5ib3hlcy5mb3JFYWNoKChzdWJCb3gpID0+IGRvbWlmeUJveChzdWJCb3gsIHN1YkJveGVzTm9kZSwgZGVwdGggKyAxKSk7XG4gICAgYm94Tm9kZS5hcHBlbmRDaGlsZChzdWJCb3hlc05vZGUpO1xuICB9IGVsc2UgaWYgKG9iamVjdFByb3BlcnRpZXMubGVuZ3RoKSB7XG4gICAgb2JqZWN0UHJvcGVydGllcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGJveFtrZXldKSkge1xuICAgICAgICBkb21pZnlCb3goe1xuICAgICAgICAgIHR5cGU6IGtleSxcbiAgICAgICAgICBib3hlczogYm94W2tleV1cbiAgICAgICAgfSxcbiAgICAgICAgc3ViQm94ZXNOb2RlLFxuICAgICAgICBkZXB0aCArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9taWZ5Qm94KGJveFtrZXldLCBzdWJCb3hlc05vZGUsIGRlcHRoICsgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYm94Tm9kZS5hcHBlbmRDaGlsZChzdWJCb3hlc05vZGUpO1xuICB9XG5cbiAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChib3hOb2RlKTtcbn07XG5cbmNvbnN0IG1ha2VQcm9wZXJ0eSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgcGFyZW50Tm9kZSkge1xuICB2YXIgbmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtbmFtZScpO1xuICB2YXIgdmFsdWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbXA0LXZhbHVlJyk7XG4gIHZhciBwcm9wZXJ0eU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtcHJvcGVydHknKTtcblxuICBuYW1lTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScsIG5hbWUpO1xuICBuYW1lTm9kZS50ZXh0Q29udGVudCA9IG5hbWU7XG5cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5KSB7XG4gICAgbGV0IHN0clZhbHVlID0gZGF0YVRvSGV4KHZhbHVlLCAnJyk7XG4gICAgbGV0IHRydW5jVmFsdWUgPSBzdHJWYWx1ZS5zbGljZSgwLCAxMDI5KTsgLy8gMjEgcm93cyBvZiAxNiBieXRlc1xuXG4gICAgaWYgKHRydW5jVmFsdWUubGVuZ3RoIDwgc3RyVmFsdWUubGVuZ3RoKSB7XG4gICAgICB0cnVuY1ZhbHVlICs9ICc8JyArICh2YWx1ZS5ieXRlTGVuZ3RoIC0gMzM2KSArICdiIHJlbWFpbmluZyBvZiAnICsgdmFsdWUuYnl0ZUxlbmd0aCArICdiIHRvdGFsPic7XG4gICAgfVxuXG4gICAgdmFsdWVOb2RlLnNldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScsIHRydW5jVmFsdWUudG9VcHBlckNhc2UoKSk7XG4gICAgdmFsdWVOb2RlLmlubmVySFRNTCA9IHRydW5jVmFsdWU7XG4gICAgdmFsdWVOb2RlLmNsYXNzTGlzdC5hZGQoJ3ByZS1saWtlJyk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBsZXQgc3RyVmFsdWUgPSAnWycgKyB2YWx1ZS5qb2luKCcsICcpICsgJ10nO1xuICAgIHZhbHVlTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnLCBzdHJWYWx1ZSk7XG4gICAgdmFsdWVOb2RlLnRleHRDb250ZW50ID0gc3RyVmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWVOb2RlLnNldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScsIHZhbHVlKTtcbiAgICB2YWx1ZU5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfVxuXG4gIHByb3BlcnR5Tm9kZS5hcHBlbmRDaGlsZChuYW1lTm9kZSk7XG4gIHByb3BlcnR5Tm9kZS5hcHBlbmRDaGlsZCh2YWx1ZU5vZGUpO1xuXG4gIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQocHJvcGVydHlOb2RlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5zcGVjdDogaW5zcGVjdEZsdixcbiAgZG9taWZ5OiBkb21pZnlGbHZcbn07XG4iLCJpbXBvcnQgbXA0SW5zcGVjdG9yIGZyb20gJy4vbXA0JztcbmltcG9ydCB0c0luc3BlY3RvciBmcm9tICcuL3RzJztcbmltcG9ydCBmbHZJbnNwZWN0b3IgZnJvbSAnLi9mbHYnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG1wNEluc3BlY3RvcixcbiAgdHNJbnNwZWN0b3IsXG4gIGZsdkluc3BlY3RvclxufTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge1xuICBkaXNjYXJkRW11bGF0aW9uUHJldmVudGlvbixcbiAgcGljUGFyYW1ldGVyU2V0LFxuICBzZXFQYXJhbWV0ZXJTZXRcbn0gZnJvbSAnLi4vYml0LXN0cmVhbXMvaDI2NCc7XG5cbmltcG9ydCB7bmFsUGFyc2VBVkNDLCBtZXJnZVBTfSBmcm9tICcuL2NvbW1vbi9uYWwtcGFyc2UnO1xuaW1wb3J0IGRhdGFUb0hleCBmcm9tICcuL2NvbW1vbi9kYXRhLXRvLWhleC5qcyc7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhbiBBU0NJSSBlbmNvZGVkIGZvdXIgYnl0ZSBidWZmZXIuXG4gICAqIEBwYXJhbSBidWZmZXIge1VpbnQ4QXJyYXl9IGEgZm91ci1ieXRlIGJ1ZmZlciB0byB0cmFuc2xhdGVcbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgY29ycmVzcG9uZGluZyBzdHJpbmdcbiAgICovXG5jb25zdCBwYXJzZVR5cGUgPSBmdW5jdGlvbiAoYnVmZmVyKSB7XG4gIHZhciByZXN1bHQgPSAnJztcbiAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyWzBdKTtcbiAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyWzFdKTtcbiAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyWzJdKTtcbiAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyWzNdKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHBhcnNlTXA0RGF0ZSA9IGZ1bmN0aW9uIChzZWNvbmRzKSB7XG4gIHJldHVybiBuZXcgRGF0ZShzZWNvbmRzICogMTAwMCAtIDIwODI4NDQ4MDAwMDApO1xufTtcblxuY29uc3QgcGFyc2VTYW1wbGVGbGFncyA9IGZ1bmN0aW9uIChmbGFncykge1xuICByZXR1cm4ge1xuICAgIGlzTGVhZGluZzogKGZsYWdzWzBdICYgMHgwYykgPj4+IDIsXG4gICAgZGVwZW5kc09uOiBmbGFnc1swXSAmIDB4MDMsXG4gICAgaXNEZXBlbmRlZE9uOiAoZmxhZ3NbMV0gJiAweGMwKSA+Pj4gNixcbiAgICBoYXNSZWR1bmRhbmN5OiAoZmxhZ3NbMV0gJiAweDMwKSA+Pj4gNCxcbiAgICBwYWRkaW5nVmFsdWU6IChmbGFnc1sxXSAmIDB4MGUpID4+PiAxLFxuICAgIGlzTm9uU3luY1NhbXBsZTogZmxhZ3NbMV0gJiAweDAxLFxuICAgIGRlZ3JhZGF0aW9uUHJpb3JpdHk6IChmbGFnc1syXSA8PCA4KSB8IGZsYWdzWzNdXG4gIH07XG59O1xuXG5sZXQgbGFzdFNQUztcbmxldCBsYXN0UFBTO1xubGV0IGxhc3RPcHRpb25zO1xuXG4vLyByZWdpc3RyeSBvZiBoYW5kbGVycyBmb3IgaW5kaXZpZHVhbCBtcDQgYm94IHR5cGVzXG5jb25zdCBwYXJzZSA9IHtcbiAgLy8gY29kaW5nbmFtZSwgbm90IGEgZmlyc3QtY2xhc3MgYm94IHR5cGUuIHN0c2QgZW50cmllcyBzaGFyZSB0aGVcbiAgLy8gc2FtZSBmb3JtYXQgYXMgcmVhbCBib3hlcyBzbyB0aGUgcGFyc2luZyBpbmZyYXN0cnVjdHVyZSBjYW4gYmVcbiAgLy8gc2hhcmVkXG4gIGF2YzE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YVJlZmVyZW5jZUluZGV4OiB2aWV3LmdldFVpbnQxNig2KSxcbiAgICAgIHdpZHRoOiB2aWV3LmdldFVpbnQxNigyNCksXG4gICAgICBoZWlnaHQ6IHZpZXcuZ2V0VWludDE2KDI2KSxcbiAgICAgIGhvcml6cmVzb2x1dGlvbjogdmlldy5nZXRVaW50MTYoMjgpICsgKHZpZXcuZ2V0VWludDE2KDMwKSAvIDE2KSxcbiAgICAgIHZlcnRyZXNvbHV0aW9uOiB2aWV3LmdldFVpbnQxNigzMikgKyAodmlldy5nZXRVaW50MTYoMzQpIC8gMTYpLFxuICAgICAgZnJhbWVDb3VudDogdmlldy5nZXRVaW50MTYoNDApLFxuICAgICAgZGVwdGg6IHZpZXcuZ2V0VWludDE2KDc0KSxcbiAgICAgIGNvbmZpZzogaW5zcGVjdE1wNChkYXRhLnN1YmFycmF5KDc4LCBkYXRhLmJ5dGVMZW5ndGgpKVxuICAgIH07XG4gIH0sXG4gIGF2Y0M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyXG4gICAgICB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb25WZXJzaW9uOiBkYXRhWzBdLFxuICAgICAgICBhdmNQcm9maWxlSW5kaWNhdGlvbjogZGF0YVsxXSxcbiAgICAgICAgcHJvZmlsZUNvbXBhdGliaWxpdHk6IGRhdGFbMl0sXG4gICAgICAgIGF2Y0xldmVsSW5kaWNhdGlvbjogZGF0YVszXSxcbiAgICAgICAgbGVuZ3RoU2l6ZU1pbnVzT25lOiBkYXRhWzRdICYgMHgwMyxcbiAgICAgICAgc3BzOiBbXSxcbiAgICAgICAgcHBzOiBbXVxuICAgICAgfSxcbiAgICAgIG51bU9mU2VxdWVuY2VQYXJhbWV0ZXJTZXRzID0gZGF0YVs1XSAmIDB4MWYsXG4gICAgICBudW1PZlBpY3R1cmVQYXJhbWV0ZXJTZXRzLFxuICAgICAgbmFsU2l6ZSxcbiAgICAgIG9mZnNldCxcbiAgICAgIGk7XG5cbiAgICAvLyBpdGVyYXRlIHBhc3QgYW55IFNQU3NcbiAgICBvZmZzZXQgPSA2O1xuICAgIGZvciAoaSA9IDA7IGkgPCBudW1PZlNlcXVlbmNlUGFyYW1ldGVyU2V0czsgaSsrKSB7XG4gICAgICBuYWxTaXplID0gdmlldy5nZXRVaW50MTYob2Zmc2V0KTtcbiAgICAgIG9mZnNldCArPSAyO1xuICAgICAgdmFyIG5hbERhdGEgPSBkaXNjYXJkRW11bGF0aW9uUHJldmVudGlvbihuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KG9mZnNldCArIDEsIG9mZnNldCArIG5hbFNpemUpKSk7XG4gICAgICBsYXN0U1BTID0gc2VxUGFyYW1ldGVyU2V0LmRlY29kZShuYWxEYXRhKTtcbiAgICAgIGxhc3RPcHRpb25zID0gbWVyZ2VQUyhsYXN0UFBTLCBsYXN0U1BTKTtcbiAgICAgIHJlc3VsdC5zcHMucHVzaChsYXN0U1BTKTtcbiAgICAgIG9mZnNldCArPSBuYWxTaXplO1xuICAgIH1cbiAgICAvLyBpdGVyYXRlIHBhc3QgYW55IFBQU3NcbiAgICBudW1PZlBpY3R1cmVQYXJhbWV0ZXJTZXRzID0gZGF0YVtvZmZzZXRdO1xuICAgIG9mZnNldCsrO1xuICAgIGZvciAoaSA9IDA7IGkgPCBudW1PZlBpY3R1cmVQYXJhbWV0ZXJTZXRzOyBpKyspIHtcbiAgICAgIG5hbFNpemUgPSB2aWV3LmdldFVpbnQxNihvZmZzZXQpO1xuICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICB2YXIgbmFsRGF0YSA9IGRpc2NhcmRFbXVsYXRpb25QcmV2ZW50aW9uKG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkob2Zmc2V0ICsgMSwgb2Zmc2V0ICsgbmFsU2l6ZSkpKTtcbiAgICAgIGxhc3RQUFMgPSBwaWNQYXJhbWV0ZXJTZXQuZGVjb2RlKG5hbERhdGEpO1xuICAgICAgbGFzdE9wdGlvbnMgPSBtZXJnZVBTKGxhc3RQUFMsIGxhc3RTUFMpO1xuICAgICAgcmVzdWx0LnBwcy5wdXNoKGxhc3RQUFMpO1xuICAgICAgb2Zmc2V0ICs9IG5hbFNpemU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIGJ0cnQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICByZXR1cm4ge1xuICAgICAgYnVmZmVyU2l6ZURCOiB2aWV3LmdldFVpbnQzMigwKSxcbiAgICAgIG1heEJpdHJhdGU6IHZpZXcuZ2V0VWludDMyKDQpLFxuICAgICAgYXZnQml0cmF0ZTogdmlldy5nZXRVaW50MzIoOClcbiAgICB9O1xuICB9LFxuICBlc2RzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiBkYXRhWzBdLFxuICAgICAgZmxhZ3M6IG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkoMSwgNCkpLFxuICAgICAgZXNJZDogKGRhdGFbNl0gPDwgOCkgfCBkYXRhWzddLFxuICAgICAgc3RyZWFtUHJpb3JpdHk6IGRhdGFbOF0gJiAweDFmLFxuICAgICAgZGVjb2RlckNvbmZpZzoge1xuICAgICAgICBvYmplY3RQcm9maWxlSW5kaWNhdGlvbjogZGF0YVsxMV0sXG4gICAgICAgIHN0cmVhbVR5cGU6IChkYXRhWzEyXSA+Pj4gMikgJiAweDNmLFxuICAgICAgICBidWZmZXJTaXplOiAoZGF0YVsxM10gPDwgMTYpIHwgKGRhdGFbMTRdIDw8IDgpIHwgZGF0YVsxNV0sXG4gICAgICAgIG1heEJpdHJhdGU6IChkYXRhWzE2XSA8PCAyNCkgfFxuICAgICAgICAgIChkYXRhWzE3XSA8PCAxNikgfFxuICAgICAgICAgIChkYXRhWzE4XSA8PCAgOCkgfFxuICAgICAgICAgIGRhdGFbMTldLFxuICAgICAgICBhdmdCaXRyYXRlOiAoZGF0YVsyMF0gPDwgMjQpIHxcbiAgICAgICAgICAoZGF0YVsyMV0gPDwgMTYpIHxcbiAgICAgICAgICAoZGF0YVsyMl0gPDwgIDgpIHxcbiAgICAgICAgICBkYXRhWzIzXSxcbiAgICAgICAgZGVjb2RlckNvbmZpZ0Rlc2NyaXB0b3I6IHtcbiAgICAgICAgICB0YWc6IGRhdGFbMjRdLFxuICAgICAgICAgIGxlbmd0aDogZGF0YVsyNV0sXG4gICAgICAgICAgYXVkaW9PYmplY3RUeXBlOiAoZGF0YVsyNl0gPj4+IDMpICYgMHgxZixcbiAgICAgICAgICBzYW1wbGluZ0ZyZXF1ZW5jeUluZGV4OiAoKGRhdGFbMjZdICYgMHgwNykgPDwgMSkgfFxuICAgICAgICAgICAgKChkYXRhWzI3XSA+Pj4gNykgJiAweDAxKSxcbiAgICAgICAgICBjaGFubmVsQ29uZmlndXJhdGlvbjogKGRhdGFbMjddID4+PiAzKSAmIDB4MGZcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIGZ0eXA6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyXG4gICAgICB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG1ham9yQnJhbmQ6IHBhcnNlVHlwZShkYXRhLnN1YmFycmF5KDAsIDQpKSxcbiAgICAgICAgbWlub3JWZXJzaW9uOiB2aWV3LmdldFVpbnQzMig0KSxcbiAgICAgICAgY29tcGF0aWJsZUJyYW5kczogW11cbiAgICAgIH0sXG4gICAgICBpID0gODtcbiAgICB3aGlsZSAoaSA8IGRhdGEuYnl0ZUxlbmd0aCkge1xuICAgICAgcmVzdWx0LmNvbXBhdGlibGVCcmFuZHMucHVzaChwYXJzZVR5cGUoZGF0YS5zdWJhcnJheShpLCBpICsgNCkpKTtcbiAgICAgIGkgKz0gNDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgZGluZjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYm94ZXM6IGluc3BlY3RNcDQoZGF0YSlcbiAgICB9O1xuICB9LFxuICBkcmVmOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiBkYXRhWzBdLFxuICAgICAgZmxhZ3M6IG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkoMSwgNCkpLFxuICAgICAgZGF0YVJlZmVyZW5jZXM6IGluc3BlY3RNcDQoZGF0YS5zdWJhcnJheSg4KSlcbiAgICB9O1xuICB9LFxuICBoZGxyOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhclxuICAgICAgdmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLFxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICB2ZXJzaW9uOiB2aWV3LmdldFVpbnQ4KDApLFxuICAgICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICAgIGhhbmRsZXJUeXBlOiBwYXJzZVR5cGUoZGF0YS5zdWJhcnJheSg4LCAxMikpLFxuICAgICAgICBuYW1lOiAnJ1xuICAgICAgfSxcbiAgICAgIGkgPSA4O1xuXG4gICAgLy8gcGFyc2Ugb3V0IHRoZSBuYW1lIGZpZWxkXG4gICAgZm9yIChpID0gMjQ7IGkgPCBkYXRhLmJ5dGVMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGRhdGFbaV0gPT09IDB4MDApIHtcbiAgICAgICAgLy8gdGhlIG5hbWUgZmllbGQgaXMgbnVsbC10ZXJtaW5hdGVkXG4gICAgICAgIGkrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXN1bHQubmFtZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGFbaV0pO1xuICAgIH1cbiAgICAvLyBkZWNvZGUgVVRGLTggdG8gamF2YXNjcmlwdCdzIGludGVybmFsIHJlcHJlc2VudGF0aW9uXG4gICAgLy8gc2VlIGh0dHA6Ly9lY21hbmF1dC5ibG9nc3BvdC5jb20vMjAwNi8wNy9lbmNvZGluZy1kZWNvZGluZy11dGY4LWluLWphdmFzY3JpcHQuaHRtbFxuICAgIHJlc3VsdC5uYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KGdsb2JhbC5lc2NhcGUocmVzdWx0Lm5hbWUpKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIG1kYXQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ5dGVMZW5ndGg6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgIG5hbHM6IG5hbFBhcnNlQVZDQyhkYXRhKVxuICAgIH07XG4gIH0sXG4gIG1kaGQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyXG4gICAgICB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICBpID0gNCxcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICB2ZXJzaW9uOiB2aWV3LmdldFVpbnQ4KDApLFxuICAgICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICAgIGxhbmd1YWdlOiAnJ1xuICAgICAgfTtcbiAgICBpZiAocmVzdWx0LnZlcnNpb24gPT09IDEpIHtcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC5jcmVhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpOyAvLyB0cnVuY2F0aW5nIHRvcCA0IGJ5dGVzXG4gICAgICBpICs9IDg7XG4gICAgICByZXN1bHQubW9kaWZpY2F0aW9uVGltZSA9IHBhcnNlTXA0RGF0ZSh2aWV3LmdldFVpbnQzMihpKSk7IC8vIHRydW5jYXRpbmcgdG9wIDQgYnl0ZXNcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC50aW1lc2NhbGUgPSB2aWV3LmdldFVpbnQzMihpKTtcbiAgICAgIGkgKz0gODtcbiAgICAgIHJlc3VsdC5kdXJhdGlvbiA9IHZpZXcuZ2V0VWludDMyKGkpOyAvLyB0cnVuY2F0aW5nIHRvcCA0IGJ5dGVzXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5jcmVhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpO1xuICAgICAgaSArPSA0O1xuICAgICAgcmVzdWx0Lm1vZGlmaWNhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpO1xuICAgICAgaSArPSA0O1xuICAgICAgcmVzdWx0LnRpbWVzY2FsZSA9IHZpZXcuZ2V0VWludDMyKGkpO1xuICAgICAgaSArPSA0O1xuICAgICAgcmVzdWx0LmR1cmF0aW9uID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgfVxuICAgIGkgKz0gNDtcbiAgICAvLyBsYW5ndWFnZSBpcyBzdG9yZWQgYXMgYW4gSVNPLTYzOS0yL1QgY29kZSBpbiBhbiBhcnJheSBvZiB0aHJlZSA1LWJpdCBmaWVsZHNcbiAgICAvLyBlYWNoIGZpZWxkIGlzIHRoZSBwYWNrZWQgZGlmZmVyZW5jZSBiZXR3ZWVuIGl0cyBBU0NJSSB2YWx1ZSBhbmQgMHg2MFxuICAgIGxhbmd1YWdlID0gdmlldy5nZXRVaW50MTYoaSk7XG4gICAgcmVzdWx0Lmxhbmd1YWdlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGxhbmd1YWdlID4+IDEwKSArIDB4NjApO1xuICAgIHJlc3VsdC5sYW5ndWFnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgobGFuZ3VhZ2UgJiAweDAzYzApID4+IDUpICsgMHg2MCk7XG4gICAgcmVzdWx0Lmxhbmd1YWdlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGxhbmd1YWdlICYgMHgxZikgKyAweDYwKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIG1kaWE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJveGVzOiBpbnNwZWN0TXA0KGRhdGEpXG4gICAgfTtcbiAgfSxcbiAgbWZoZDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogZGF0YVswXSxcbiAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKSxcbiAgICAgIHNlcXVlbmNlTnVtYmVyOiAoZGF0YVs0XSA8PCAyNCkgfFxuICAgICAgICAoZGF0YVs1XSA8PCAxNikgfFxuICAgICAgICAoZGF0YVs2XSA8PCA4KSB8XG4gICAgICAgIChkYXRhWzddKVxuICAgIH07XG4gIH0sXG4gIG1pbmY6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJveGVzOiBpbnNwZWN0TXA0KGRhdGEpXG4gICAgfTtcbiAgfSxcbiAgLy8gY29kaW5nbmFtZSwgbm90IGEgZmlyc3QtY2xhc3MgYm94IHR5cGUuIHN0c2QgZW50cmllcyBzaGFyZSB0aGVcbiAgLy8gc2FtZSBmb3JtYXQgYXMgcmVhbCBib3hlcyBzbyB0aGUgcGFyc2luZyBpbmZyYXN0cnVjdHVyZSBjYW4gYmVcbiAgLy8gc2hhcmVkXG4gIG1wNGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyXG4gICAgICB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIC8vIDYgYnl0ZXMgcmVzZXJ2ZWRcbiAgICAgICAgZGF0YVJlZmVyZW5jZUluZGV4OiB2aWV3LmdldFVpbnQxNig2KSxcbiAgICAgICAgLy8gNCArIDQgYnl0ZXMgcmVzZXJ2ZWRcbiAgICAgICAgY2hhbm5lbGNvdW50OiB2aWV3LmdldFVpbnQxNigxNiksXG4gICAgICAgIHNhbXBsZXNpemU6IHZpZXcuZ2V0VWludDE2KDE4KSxcbiAgICAgICAgLy8gMiBieXRlcyBwcmVfZGVmaW5lZFxuICAgICAgICAvLyAyIGJ5dGVzIHJlc2VydmVkXG4gICAgICAgIHNhbXBsZXJhdGU6IHZpZXcuZ2V0VWludDE2KDI0KSArICh2aWV3LmdldFVpbnQxNigyNikgLyA2NTUzNilcbiAgICAgIH07XG5cbiAgICAvLyBpZiB0aGVyZSBhcmUgbW9yZSBieXRlcyB0byBwcm9jZXNzLCBhc3N1bWUgdGhpcyBpcyBhbiBJU08vSUVDXG4gICAgLy8gMTQ0OTYtMTQgTVA0QXVkaW9TYW1wbGVFbnRyeSBhbmQgcGFyc2UgdGhlIEVTREJveFxuICAgIGlmIChkYXRhLmJ5dGVMZW5ndGggPiAyOCkge1xuICAgICAgcmVzdWx0LnN0cmVhbURlc2NyaXB0b3IgPSBpbnNwZWN0TXA0KGRhdGEuc3ViYXJyYXkoMjgpKVswXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgbW9vZjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYm94ZXM6IGluc3BlY3RNcDQoZGF0YSlcbiAgICB9O1xuICB9LFxuICBtb292OiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiB7XG4gICAgICBib3hlczogaW5zcGVjdE1wNChkYXRhKVxuICAgIH07XG4gIH0sXG4gIG12ZXg6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJveGVzOiBpbnNwZWN0TXA0KGRhdGEpXG4gICAgfTtcbiAgfSxcbiAgbXZoZDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXJcbiAgICAgIHZpZXcgPSBuZXcgRGF0YVZpZXcoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKSxcbiAgICAgIGkgPSA0LFxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICB2ZXJzaW9uOiB2aWV3LmdldFVpbnQ4KDApLFxuICAgICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSlcbiAgICAgIH07XG5cbiAgICBpZiAocmVzdWx0LnZlcnNpb24gPT09IDEpIHtcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC5jcmVhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpOyAvLyB0cnVuY2F0aW5nIHRvcCA0IGJ5dGVzXG4gICAgICBpICs9IDg7XG4gICAgICByZXN1bHQubW9kaWZpY2F0aW9uVGltZSA9IHBhcnNlTXA0RGF0ZSh2aWV3LmdldFVpbnQzMihpKSk7IC8vIHRydW5jYXRpbmcgdG9wIDQgYnl0ZXNcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC50aW1lc2NhbGUgPSB2aWV3LmdldFVpbnQzMihpKTtcbiAgICAgIGkgKz0gODtcbiAgICAgIHJlc3VsdC5kdXJhdGlvbiA9IHZpZXcuZ2V0VWludDMyKGkpOyAvLyB0cnVuY2F0aW5nIHRvcCA0IGJ5dGVzXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5jcmVhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpO1xuICAgICAgaSArPSA0O1xuICAgICAgcmVzdWx0Lm1vZGlmaWNhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpO1xuICAgICAgaSArPSA0O1xuICAgICAgcmVzdWx0LnRpbWVzY2FsZSA9IHZpZXcuZ2V0VWludDMyKGkpO1xuICAgICAgaSArPSA0O1xuICAgICAgcmVzdWx0LmR1cmF0aW9uID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgfVxuICAgIGkgKz0gNDtcblxuICAgIC8vIGNvbnZlcnQgZml4ZWQtcG9pbnQsIGJhc2UgMTYgYmFjayB0byBhIG51bWJlclxuICAgIHJlc3VsdC5yYXRlID0gdmlldy5nZXRVaW50MTYoaSkgKyAodmlldy5nZXRVaW50MTYoaSArIDIpIC8gMTYpO1xuICAgIGkgKz0gNDtcbiAgICByZXN1bHQudm9sdW1lID0gdmlldy5nZXRVaW50OChpKSArICh2aWV3LmdldFVpbnQ4KGkgKyAxKSAvIDgpO1xuICAgIGkgKz0gMjtcbiAgICBpICs9IDI7XG4gICAgaSArPSAyICogNDtcbiAgICByZXN1bHQubWF0cml4ID0gbmV3IFVpbnQzMkFycmF5KGRhdGEuc3ViYXJyYXkoaSwgaSArICg5ICogNCkpKTtcbiAgICBpICs9IDkgKiA0O1xuICAgIGkgKz0gNiAqIDQ7XG4gICAgcmVzdWx0Lm5leHRUcmFja0lkID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgcGRpbjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpO1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiB2aWV3LmdldFVpbnQ4KDApLFxuICAgICAgZmxhZ3M6IG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkoMSwgNCkpLFxuICAgICAgcmF0ZTogdmlldy5nZXRVaW50MzIoNCksXG4gICAgICBpbml0aWFsRGVsYXk6IHZpZXcuZ2V0VWludDMyKDgpXG4gICAgfTtcbiAgfSxcbiAgc2R0cDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXJcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgdmVyc2lvbjogZGF0YVswXSxcbiAgICAgICAgZmxhZ3M6IG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkoMSwgNCkpLFxuICAgICAgICBzYW1wbGVzOiBbXVxuICAgICAgfSwgaTtcblxuICAgIGZvciAoaSA9IDQ7IGkgPCBkYXRhLmJ5dGVMZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnNhbXBsZXMucHVzaCh7XG4gICAgICAgIGRlcGVuZHNPbjogKGRhdGFbaV0gJiAweDMwKSA+PiA0LFxuICAgICAgICBpc0RlcGVuZGVkT246IChkYXRhW2ldICYgMHgwYykgPj4gMixcbiAgICAgICAgaGFzUmVkdW5kYW5jeTogZGF0YVtpXSAmIDB4MDNcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICBzaWR4OiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICB2ZXJzaW9uOiBkYXRhWzBdLFxuICAgICAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKSxcbiAgICAgICAgICByZWZlcmVuY2VzOiBbXSxcbiAgICAgICAgICByZWZlcmVuY2VJZDogdmlldy5nZXRVaW50MzIoNCksXG4gICAgICAgICAgdGltZXNjYWxlOiB2aWV3LmdldFVpbnQzMig4KSxcbiAgICAgICAgICBlYXJsaWVzdFByZXNlbnRhdGlvblRpbWU6IHZpZXcuZ2V0VWludDMyKDEyKSxcbiAgICAgICAgICBmaXJzdE9mZnNldDogdmlldy5nZXRVaW50MzIoMTYpXG4gICAgICAgIH0sXG4gICAgICAgIHJlZmVyZW5jZUNvdW50ID0gdmlldy5nZXRVaW50MTYoMjIpLFxuICAgICAgICBpO1xuXG4gICAgZm9yIChpID0gMjQ7IHJlZmVyZW5jZUNvdW50OyBpICs9IDEyLCByZWZlcmVuY2VDb3VudC0tKSB7XG4gICAgICByZXN1bHQucmVmZXJlbmNlcy5wdXNoKHtcbiAgICAgICAgcmVmZXJlbmNlVHlwZTogKGRhdGFbaV0gJiAweDgwKSA+Pj4gNyxcbiAgICAgICAgcmVmZXJlbmNlZFNpemU6IHZpZXcuZ2V0VWludDMyKGkpICYgMHg3RkZGRkZGRixcbiAgICAgICAgc3Vic2VnbWVudER1cmF0aW9uOiB2aWV3LmdldFVpbnQzMihpICsgNCksXG4gICAgICAgIHN0YXJ0c1dpdGhTYXA6ICEhKGRhdGFbaSArIDhdICYgMHg4MCksXG4gICAgICAgIHNhcFR5cGU6IChkYXRhW2kgKyA4XSAmIDB4NzApID4+PiA0LFxuICAgICAgICBzYXBEZWx0YVRpbWU6IHZpZXcuZ2V0VWludDMyKGkgKyA4KSAmIDB4MEZGRkZGRkZcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIHNtaGQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IGRhdGFbMF0sXG4gICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICBiYWxhbmNlOiBkYXRhWzRdICsgKGRhdGFbNV0gLyAyNTYpXG4gICAgfTtcbiAgfSxcbiAgc3RibDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYm94ZXM6IGluc3BlY3RNcDQoZGF0YSlcbiAgICB9O1xuICB9LFxuICBzdGNvOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhclxuICAgICAgdmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLFxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICB2ZXJzaW9uOiBkYXRhWzBdLFxuICAgICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICAgIGNodW5rT2Zmc2V0czogW11cbiAgICAgIH0sXG4gICAgICBlbnRyeUNvdW50ID0gdmlldy5nZXRVaW50MzIoNCksXG4gICAgICBpO1xuICAgIGZvciAoaSA9IDg7IGVudHJ5Q291bnQ7IGkgKz0gNCwgZW50cnlDb3VudC0tKSB7XG4gICAgICByZXN1bHQuY2h1bmtPZmZzZXRzLnB1c2godmlldy5nZXRVaW50MzIoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICBzdHNjOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhclxuICAgICAgdmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLFxuICAgICAgZW50cnlDb3VudCA9IHZpZXcuZ2V0VWludDMyKDQpLFxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICB2ZXJzaW9uOiBkYXRhWzBdLFxuICAgICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICAgIHNhbXBsZVRvQ2h1bmtzOiBbXVxuICAgICAgfSxcbiAgICAgIGk7XG4gICAgZm9yIChpID0gODsgZW50cnlDb3VudDsgaSArPSAxMiwgZW50cnlDb3VudC0tKSB7XG4gICAgICByZXN1bHQuc2FtcGxlVG9DaHVua3MucHVzaCh7XG4gICAgICAgIGZpcnN0Q2h1bms6IHZpZXcuZ2V0VWludDMyKGkpLFxuICAgICAgICBzYW1wbGVzUGVyQ2h1bms6IHZpZXcuZ2V0VWludDMyKGkgKyA0KSxcbiAgICAgICAgc2FtcGxlRGVzY3JpcHRpb25JbmRleDogdmlldy5nZXRVaW50MzIoaSArIDgpXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgc3RzZDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogZGF0YVswXSxcbiAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKSxcbiAgICAgIHNhbXBsZURlc2NyaXB0aW9uczogaW5zcGVjdE1wNChkYXRhLnN1YmFycmF5KDgpKVxuICAgIH07XG4gIH0sXG4gIHN0c3o6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyXG4gICAgICB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIHZlcnNpb246IGRhdGFbMF0sXG4gICAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKSxcbiAgICAgICAgc2FtcGxlU2l6ZTogdmlldy5nZXRVaW50MzIoNCksXG4gICAgICAgIGVudHJpZXM6IFtdXG4gICAgICB9LFxuICAgICAgaTtcbiAgICBmb3IgKGkgPSAxMjsgaSA8IGRhdGEuYnl0ZUxlbmd0aDsgaSArPSA0KSB7XG4gICAgICByZXN1bHQuZW50cmllcy5wdXNoKHZpZXcuZ2V0VWludDMyKGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgc3R0czogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXJcbiAgICAgIHZpZXcgPSBuZXcgRGF0YVZpZXcoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKSxcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgdmVyc2lvbjogZGF0YVswXSxcbiAgICAgICAgZmxhZ3M6IG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkoMSwgNCkpLFxuICAgICAgICB0aW1lVG9TYW1wbGVzOiBbXVxuICAgICAgfSxcbiAgICAgIGVudHJ5Q291bnQgPSB2aWV3LmdldFVpbnQzMig0KSxcbiAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSA4OyBlbnRyeUNvdW50OyBpICs9IDgsIGVudHJ5Q291bnQtLSkge1xuICAgICAgcmVzdWx0LnRpbWVUb1NhbXBsZXMucHVzaCh7XG4gICAgICAgIHNhbXBsZUNvdW50OiB2aWV3LmdldFVpbnQzMihpKSxcbiAgICAgICAgc2FtcGxlRGVsdGE6IHZpZXcuZ2V0VWludDMyKGkgKyA0KVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIHN0eXA6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHBhcnNlLmZ0eXAoZGF0YSk7XG4gIH0sXG4gIHRmZHQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgIHZlcnNpb246IGRhdGFbMF0sXG4gICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICBiYXNlTWVkaWFEZWNvZGVUaW1lOiBkYXRhWzRdIDw8IDI0IHwgZGF0YVs1XSA8PCAxNiB8IGRhdGFbNl0gPDwgOCB8IGRhdGFbN11cbiAgICB9O1xuICAgIGlmIChyZXN1bHQudmVyc2lvbiA9PT0gMSkge1xuICAgICAgcmVzdWx0LmJhc2VNZWRpYURlY29kZVRpbWUgKj0gTWF0aC5wb3coMiwgMzIpO1xuICAgICAgcmVzdWx0LmJhc2VNZWRpYURlY29kZVRpbWUgKz0gZGF0YVs4XSA8PCAyNCB8IGRhdGFbOV0gPDwgMTYgfCBkYXRhWzEwXSA8PCA4IHwgZGF0YVsxMV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIHRmaGQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyXG4gICAgICB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIHZlcnNpb246IGRhdGFbMF0sXG4gICAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKSxcbiAgICAgICAgdHJhY2tJZDogdmlldy5nZXRVaW50MzIoNClcbiAgICAgIH0sXG4gICAgICBiYXNlRGF0YU9mZnNldFByZXNlbnQgPSByZXN1bHQuZmxhZ3NbMl0gJiAweDAxLFxuICAgICAgc2FtcGxlRGVzY3JpcHRpb25JbmRleFByZXNlbnQgPSByZXN1bHQuZmxhZ3NbMl0gJiAweDAyLFxuICAgICAgZGVmYXVsdFNhbXBsZUR1cmF0aW9uUHJlc2VudCA9IHJlc3VsdC5mbGFnc1syXSAmIDB4MDgsXG4gICAgICBkZWZhdWx0U2FtcGxlU2l6ZVByZXNlbnQgPSByZXN1bHQuZmxhZ3NbMl0gJiAweDEwLFxuICAgICAgZGVmYXVsdFNhbXBsZUZsYWdzUHJlc2VudCA9IHJlc3VsdC5mbGFnc1syXSAmIDB4MjAsXG4gICAgICBpO1xuXG4gICAgaSA9IDg7XG4gICAgaWYgKGJhc2VEYXRhT2Zmc2V0UHJlc2VudCkge1xuICAgICAgaSArPSA0OyAvLyB0cnVuY2F0ZSB0b3AgNCBieXRlc1xuICAgICAgcmVzdWx0LmJhc2VEYXRhT2Zmc2V0ID0gdmlldy5nZXRVaW50MzIoMTIpO1xuICAgICAgaSArPSA0O1xuICAgIH1cbiAgICBpZiAoc2FtcGxlRGVzY3JpcHRpb25JbmRleFByZXNlbnQpIHtcbiAgICAgIHJlc3VsdC5zYW1wbGVEZXNjcmlwdGlvbkluZGV4ID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgICBpICs9IDQ7XG4gICAgfVxuICAgIGlmIChkZWZhdWx0U2FtcGxlRHVyYXRpb25QcmVzZW50KSB7XG4gICAgICByZXN1bHQuZGVmYXVsdFNhbXBsZUR1cmF0aW9uID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgICBpICs9IDQ7XG4gICAgfVxuICAgIGlmIChkZWZhdWx0U2FtcGxlU2l6ZVByZXNlbnQpIHtcbiAgICAgIHJlc3VsdC5kZWZhdWx0U2FtcGxlU2l6ZSA9IHZpZXcuZ2V0VWludDMyKGkpO1xuICAgICAgaSArPSA0O1xuICAgIH1cbiAgICBpZiAoZGVmYXVsdFNhbXBsZUZsYWdzUHJlc2VudCkge1xuICAgICAgcmVzdWx0LmRlZmF1bHRTYW1wbGVGbGFncyA9IHZpZXcuZ2V0VWludDMyKGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICB0a2hkOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhclxuICAgICAgdmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLFxuICAgICAgaSA9IDQsXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIHZlcnNpb246IHZpZXcuZ2V0VWludDgoMCksXG4gICAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKVxuICAgICAgfTtcbiAgICBpZiAocmVzdWx0LnZlcnNpb24gPT09IDEpIHtcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC5jcmVhdGlvblRpbWUgPSBwYXJzZU1wNERhdGUodmlldy5nZXRVaW50MzIoaSkpOyAvLyB0cnVuY2F0aW5nIHRvcCA0IGJ5dGVzXG4gICAgICBpICs9IDg7XG4gICAgICByZXN1bHQubW9kaWZpY2F0aW9uVGltZSA9IHBhcnNlTXA0RGF0ZSh2aWV3LmdldFVpbnQzMihpKSk7IC8vIHRydW5jYXRpbmcgdG9wIDQgYnl0ZXNcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC50cmFja0lkID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgICBpICs9IDQ7XG4gICAgICBpICs9IDg7XG4gICAgICByZXN1bHQuZHVyYXRpb24gPSB2aWV3LmdldFVpbnQzMihpKTsgLy8gdHJ1bmNhdGluZyB0b3AgNCBieXRlc1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuY3JlYXRpb25UaW1lID0gcGFyc2VNcDREYXRlKHZpZXcuZ2V0VWludDMyKGkpKTtcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC5tb2RpZmljYXRpb25UaW1lID0gcGFyc2VNcDREYXRlKHZpZXcuZ2V0VWludDMyKGkpKTtcbiAgICAgIGkgKz0gNDtcbiAgICAgIHJlc3VsdC50cmFja0lkID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgICBpICs9IDQ7XG4gICAgICBpICs9IDQ7XG4gICAgICByZXN1bHQuZHVyYXRpb24gPSB2aWV3LmdldFVpbnQzMihpKTtcbiAgICB9XG4gICAgaSArPSA0O1xuICAgIGkgKz0gMiAqIDQ7XG4gICAgcmVzdWx0LmxheWVyID0gdmlldy5nZXRVaW50MTYoaSk7XG4gICAgaSArPSAyO1xuICAgIHJlc3VsdC5hbHRlcm5hdGVHcm91cCA9IHZpZXcuZ2V0VWludDE2KGkpO1xuICAgIGkgKz0gMjtcbiAgICAvLyBjb252ZXJ0IGZpeGVkLXBvaW50LCBiYXNlIDE2IGJhY2sgdG8gYSBudW1iZXJcbiAgICByZXN1bHQudm9sdW1lID0gdmlldy5nZXRVaW50OChpKSArICh2aWV3LmdldFVpbnQ4KGkgKyAxKSAvIDgpO1xuICAgIGkgKz0gMjtcbiAgICBpICs9IDI7XG4gICAgcmVzdWx0Lm1hdHJpeCA9IG5ldyBVaW50MzJBcnJheShkYXRhLnN1YmFycmF5KGksIGkgKyAoOSAqIDQpKSk7XG4gICAgaSArPSA5ICogNDtcbiAgICByZXN1bHQud2lkdGggPSB2aWV3LmdldFVpbnQxNihpKSArICh2aWV3LmdldFVpbnQxNihpICsgMikgLyAxNik7XG4gICAgaSArPSA0O1xuICAgIHJlc3VsdC5oZWlnaHQgPSB2aWV3LmdldFVpbnQxNihpKSArICh2aWV3LmdldFVpbnQxNihpICsgMikgLyAxNik7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgdHJhZjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYm94ZXM6IGluc3BlY3RNcDQoZGF0YSlcbiAgICB9O1xuICB9LFxuICB0cmFrOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiB7XG4gICAgICBib3hlczogaW5zcGVjdE1wNChkYXRhKVxuICAgIH07XG4gIH0sXG4gIHRyZXg6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogZGF0YVswXSxcbiAgICAgIGZsYWdzOiBuZXcgVWludDhBcnJheShkYXRhLnN1YmFycmF5KDEsIDQpKSxcbiAgICAgIHRyYWNrSWQ6IHZpZXcuZ2V0VWludDMyKDQpLFxuICAgICAgZGVmYXVsdFNhbXBsZURlc2NyaXB0aW9uSW5kZXg6IHZpZXcuZ2V0VWludDMyKDgpLFxuICAgICAgZGVmYXVsdFNhbXBsZUR1cmF0aW9uOiB2aWV3LmdldFVpbnQzMigxMiksXG4gICAgICBkZWZhdWx0U2FtcGxlU2l6ZTogdmlldy5nZXRVaW50MzIoMTYpLFxuICAgICAgc2FtcGxlRGVwZW5kc09uOiBkYXRhWzIwXSAmIDB4MDMsXG4gICAgICBzYW1wbGVJc0RlcGVuZGVkT246IChkYXRhWzIxXSAmIDB4YzApID4+IDYsXG4gICAgICBzYW1wbGVIYXNSZWR1bmRhbmN5OiAoZGF0YVsyMV0gJiAweDMwKSA+PiA0LFxuICAgICAgc2FtcGxlUGFkZGluZ1ZhbHVlOiAoZGF0YVsyMV0gJiAweDBlKSA+PiAxLFxuICAgICAgc2FtcGxlSXNEaWZmZXJlbmNlU2FtcGxlOiAhIShkYXRhWzIxXSAmIDB4MDEpLFxuICAgICAgc2FtcGxlRGVncmFkYXRpb25Qcmlvcml0eTogdmlldy5nZXRVaW50MTYoMjIpXG4gICAgfTtcbiAgfSxcbiAgdHJ1bjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXJcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgdmVyc2lvbjogZGF0YVswXSxcbiAgICAgICAgZmxhZ3M6IG5ldyBVaW50OEFycmF5KGRhdGEuc3ViYXJyYXkoMSwgNCkpLFxuICAgICAgICBzYW1wbGVzOiBbXVxuICAgICAgfSxcbiAgICAgIHZpZXcgPSBuZXcgRGF0YVZpZXcoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKSxcbiAgICAgIGRhdGFPZmZzZXRQcmVzZW50ID0gcmVzdWx0LmZsYWdzWzJdICYgMHgwMSxcbiAgICAgIGZpcnN0U2FtcGxlRmxhZ3NQcmVzZW50ID0gcmVzdWx0LmZsYWdzWzJdICYgMHgwNCxcbiAgICAgIHNhbXBsZUR1cmF0aW9uUHJlc2VudCA9IHJlc3VsdC5mbGFnc1sxXSAmIDB4MDEsXG4gICAgICBzYW1wbGVTaXplUHJlc2VudCA9IHJlc3VsdC5mbGFnc1sxXSAmIDB4MDIsXG4gICAgICBzYW1wbGVGbGFnc1ByZXNlbnQgPSByZXN1bHQuZmxhZ3NbMV0gJiAweDA0LFxuICAgICAgc2FtcGxlQ29tcG9zaXRpb25UaW1lT2Zmc2V0UHJlc2VudCA9IHJlc3VsdC5mbGFnc1sxXSAmIDB4MDgsXG4gICAgICBzYW1wbGVDb3VudCA9IHZpZXcuZ2V0VWludDMyKDQpLFxuICAgICAgb2Zmc2V0ID0gOCxcbiAgICAgIHNhbXBsZTtcblxuICAgIGlmIChkYXRhT2Zmc2V0UHJlc2VudCkge1xuICAgICAgcmVzdWx0LmRhdGFPZmZzZXQgPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgfVxuXG4gICAgaWYgKGZpcnN0U2FtcGxlRmxhZ3NQcmVzZW50ICYmIHNhbXBsZUNvdW50KSB7XG4gICAgICBzYW1wbGUgPSB7XG4gICAgICAgIGZsYWdzOiBwYXJzZVNhbXBsZUZsYWdzKGRhdGEuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyA0KSlcbiAgICAgIH07XG4gICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIGlmIChzYW1wbGVEdXJhdGlvblByZXNlbnQpIHtcbiAgICAgICAgc2FtcGxlLmR1cmF0aW9uID0gdmlldy5nZXRVaW50MzIob2Zmc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICB9XG4gICAgICBpZiAoc2FtcGxlU2l6ZVByZXNlbnQpIHtcbiAgICAgICAgc2FtcGxlLnNpemUgPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIH1cbiAgICAgIGlmIChzYW1wbGVDb21wb3NpdGlvblRpbWVPZmZzZXRQcmVzZW50KSB7XG4gICAgICAgIHNhbXBsZS5jb21wb3NpdGlvblRpbWVPZmZzZXQgPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5zYW1wbGVzLnB1c2goc2FtcGxlKTtcbiAgICAgIHNhbXBsZUNvdW50LS07XG4gICAgfVxuXG4gICAgd2hpbGUgKHNhbXBsZUNvdW50LS0pIHtcbiAgICAgIHNhbXBsZSA9IHt9O1xuICAgICAgaWYgKHNhbXBsZUR1cmF0aW9uUHJlc2VudCkge1xuICAgICAgICBzYW1wbGUuZHVyYXRpb24gPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIH1cbiAgICAgIGlmIChzYW1wbGVTaXplUHJlc2VudCkge1xuICAgICAgICBzYW1wbGUuc2l6ZSA9IHZpZXcuZ2V0VWludDMyKG9mZnNldCk7XG4gICAgICAgIG9mZnNldCArPSA0O1xuICAgICAgfVxuICAgICAgaWYgKHNhbXBsZUZsYWdzUHJlc2VudCkge1xuICAgICAgICBzYW1wbGUuZmxhZ3MgPSBwYXJzZVNhbXBsZUZsYWdzKGRhdGEuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyA0KSk7XG4gICAgICAgIG9mZnNldCArPSA0O1xuICAgICAgfVxuICAgICAgaWYgKHNhbXBsZUNvbXBvc2l0aW9uVGltZU9mZnNldFByZXNlbnQpIHtcbiAgICAgICAgc2FtcGxlLmNvbXBvc2l0aW9uVGltZU9mZnNldCA9IHZpZXcuZ2V0VWludDMyKG9mZnNldCk7XG4gICAgICAgIG9mZnNldCArPSA0O1xuICAgICAgfVxuICAgICAgcmVzdWx0LnNhbXBsZXMucHVzaChzYW1wbGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICAndXJsICc6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IGRhdGFbMF0sXG4gICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSlcbiAgICB9O1xuICB9LFxuICB2bWhkOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IGRhdGFbMF0sXG4gICAgICBmbGFnczogbmV3IFVpbnQ4QXJyYXkoZGF0YS5zdWJhcnJheSgxLCA0KSksXG4gICAgICBncmFwaGljc21vZGU6IHZpZXcuZ2V0VWludDE2KDQpLFxuICAgICAgb3Bjb2xvcjogbmV3IFVpbnQxNkFycmF5KFt2aWV3LmdldFVpbnQxNig2KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5nZXRVaW50MTYoOCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZ2V0VWludDE2KDEwKV0pXG4gICAgfTtcbiAgfVxufTtcblxuXG4vKipcbiAqIFJldHVybiBhIGphdmFzY3JpcHQgYXJyYXkgb2YgYm94IG9iamVjdHMgcGFyc2VkIGZyb20gYW4gSVNPIGJhc2VcbiAqIG1lZGlhIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSB7VWludDhBcnJheX0gdGhlIGJpbmFyeSBkYXRhIG9mIHRoZSBtZWRpYSB0byBiZSBpbnNwZWN0ZWRcbiAqIEByZXR1cm4ge2FycmF5fSBhIGphdmFzY3JpcHQgYXJyYXkgb2YgcG90ZW50aWFsbHkgbmVzdGVkIGJveCBvYmplY3RzXG4gKi9cbmNvbnN0IGluc3BlY3RNcDQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICB2YXJcbiAgICBpID0gMCxcbiAgICByZXN1bHQgPSBbXSxcbiAgICB2aWV3LFxuICAgIHNpemUsXG4gICAgdHlwZSxcbiAgICBlbmQsXG4gICAgYm94LFxuICAgIHNlZW5NT09WID0gZmFsc2UsXG4gICAgcGVuZGluZ01EQVQgPSBudWxsO1xuXG4gIC8vIENvbnZlcnQgZGF0YSBmcm9tIFVpbnQ4QXJyYXkgdG8gQXJyYXlCdWZmZXIsIHRvIGZvbGxvdyBEYXRhdmlldyBBUElcbiAgdmFyIGFiID0gbmV3IEFycmF5QnVmZmVyKGRhdGEubGVuZ3RoKTtcbiAgdmFyIHYgPSBuZXcgVWludDhBcnJheShhYik7XG4gIGZvciAodmFyIHogPSAwOyB6IDwgZGF0YS5sZW5ndGg7ICsreikge1xuICAgICAgdlt6XSA9IGRhdGFbel07XG4gIH1cbiAgdmlldyA9IG5ldyBEYXRhVmlldyhhYik7XG5cblxuICB3aGlsZSAoaSA8IGRhdGEuYnl0ZUxlbmd0aCkge1xuICAgIC8vIHBhcnNlIGJveCBkYXRhXG4gICAgc2l6ZSA9IHZpZXcuZ2V0VWludDMyKGkpO1xuICAgIHR5cGUgPSAgcGFyc2VUeXBlKGRhdGEuc3ViYXJyYXkoaSArIDQsIGkgKyA4KSk7XG4gICAgZW5kID0gc2l6ZSA+IDEgPyBpICsgc2l6ZSA6IGRhdGEuYnl0ZUxlbmd0aDtcblxuICAgIGlmICh0eXBlID09PSAnbW9vdicpIHtcbiAgICAgIHNlZW5NT09WID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ21kYXQnICYmICFzZWVuTU9PVikge1xuICAgICAgcGVuZGluZ01EQVQgPSBkYXRhLnN1YmFycmF5KGkgKyA4LCBlbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBwYXJzZSB0eXBlLXNwZWNpZmljIGRhdGFcbiAgICAgIGJveCA9IChwYXJzZVt0eXBlXSB8fCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfTtcbiAgICAgIH0pKGRhdGEuc3ViYXJyYXkoaSArIDgsIGVuZCkpO1xuICAgICAgYm94LnNpemUgPSBzaXplO1xuICAgICAgYm94LnR5cGUgPSB0eXBlO1xuICAgICAgLy8gc3RvcmUgdGhpcyBib3ggYW5kIG1vdmUgdG8gdGhlIG5leHRcbiAgICAgIHJlc3VsdC5wdXNoKGJveCk7XG4gICAgfVxuXG4gICAgaWYgKHBlbmRpbmdNREFUICYmIHNlZW5NT09WKSB7XG4gICAgICBib3ggPSBwYXJzZVsnbWRhdCddKHBlbmRpbmdNREFUKTtcbiAgICAgIGJveC5zaXplID0gcGVuZGluZ01EQVQuYnl0ZUxlbmd0aDtcbiAgICAgIGJveC50eXBlID0gJ21kYXQnO1xuICAgICAgLy8gc3RvcmUgdGhpcyBib3ggYW5kIG1vdmUgdG8gdGhlIG5leHRcbiAgICAgIHJlc3VsdC5wdXNoKGJveCk7XG4gICAgICBwZW5kaW5nTURBVCA9IG51bGw7XG4gICAgfVxuXG4gICAgaSA9IGVuZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgamF2YXNjcmlwdCByZXByZXN0ZW50YXRpb25cbiAqIG9mIGFuIE1QNCBmaWxlLiBZb3UgY2FuIHVzZSBpdCBhcyBhbiBhbHRlcm5hdGl2ZSB0b1xuICogSlNPTi5zdHJpbmdpZnkoKSB0byBjb21wYXJlIGluc3BlY3RlZCBNUDRzLlxuICogQHBhcmFtIGluc3BlY3RlZE1wNCB7YXJyYXl9IHRoZSBwYXJzZWQgYXJyYXkgb2YgYm94ZXMgaW4gYW4gTVA0XG4gKiBmaWxlXG4gKiBAcGFyYW0gZGVwdGgge251bWJlcn0gKG9wdGlvbmFsKSB0aGUgbnVtYmVyIG9mIGFuY2VzdG9yIGJveGVzIG9mXG4gKiB0aGUgZWxlbWVudHMgb2YgaW5zcGVjdGVkTXA0LiBBc3N1bWVkIHRvIGJlIHplcm8gaWYgdW5zcGVjaWZpZWQuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGEgdGV4dCByZXByZXNlbnRhdGlvbiBvZiB0aGUgcGFyc2VkIE1QNFxuICovXG5jb25zdCB0ZXh0aWZ5TXA0ID0gZnVuY3Rpb24gKGluc3BlY3RlZE1wNCwgZGVwdGgpIHtcbiAgdmFyIGluZGVudDtcbiAgZGVwdGggPSBkZXB0aCB8fCAwO1xuICBpbmRlbnQgPSBuZXcgQXJyYXkoZGVwdGggKiAyICsgMSkuam9pbignICcpO1xuXG4gIC8vIGl0ZXJhdGUgb3ZlciBhbGwgdGhlIGJveGVzXG4gIHJldHVybiBpbnNwZWN0ZWRNcDQubWFwKGZ1bmN0aW9uIChib3gsIGluZGV4KSB7XG5cbiAgICAvLyBsaXN0IHRoZSBib3ggdHlwZSBmaXJzdCBhdCB0aGUgY3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbFxuICAgIHJldHVybiBpbmRlbnQgKyBib3gudHlwZSArICdcXG4nICtcblxuICAgICAgLy8gdGhlIHR5cGUgaXMgYWxyZWFkeSBpbmNsdWRlZCBhbmQgaGFuZGxlIGNoaWxkIGJveGVzIHNlcGFyYXRlbHlcbiAgICAgIE9iamVjdC5rZXlzKGJveCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ2JveGVzJztcblxuICAgICAgLy8gb3V0cHV0IGFsbCB0aGUgYm94IHByb3BlcnRpZXNcbiAgICAgIH0pLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBpbmRlbnQgKyAnICAnICsga2V5ICsgJzogJyxcbiAgICAgICAgICAgIHZhbHVlID0gYm94W2tleV07XG5cbiAgICAgICAgLy8gcHJpbnQgb3V0IHJhdyBieXRlcyBhcyBoZXhhZGVtaWNhbFxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5IHx8IHZhbHVlIGluc3RhbmNlb2YgVWludDMyQXJyYXkpIHtcbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgZGF0YVRvSGV4KHZhbHVlLCBpbmRlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaW5naWZ5IGdlbmVyaWMgb2JqZWN0c1xuICAgICAgICByZXR1cm4gcHJlZml4ICtcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKVxuICAgICAgICAgICAgICAuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbiAobGluZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZW50ICsgJyAgJyArIGxpbmU7XG4gICAgICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgfSkuam9pbignXFxuJykgK1xuXG4gICAgLy8gcmVjdXJzaXZlbHkgdGV4dGlmeSB0aGUgY2hpbGQgYm94ZXNcbiAgICAoYm94LmJveGVzID8gJ1xcbicgKyB0ZXh0aWZ5TXA0KGJveC5ib3hlcywgZGVwdGggKyAxKSA6ICcnKTtcbiAgfSkuam9pbignXFxuJyk7XG59O1xuXG5jb25zdCBkb21pZnlNcDQgPSBmdW5jdGlvbiAoaW5zcGVjdGVkTXA0KSB7XG4gIHZhciB0b3BMZXZlbE9iamVjdCA9IHtcbiAgICB0eXBlOiAnbXA0JyxcbiAgICBib3hlczogaW5zcGVjdGVkTXA0LFxuICAgIHNpemU6IGluc3BlY3RlZE1wNC5yZWR1Y2UoKHN1bSwgYm94KSA9PiBzdW0gKyBib3guc2l6ZSwgMClcbiAgfTtcblxuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgZG9taWZ5Qm94KHRvcExldmVsT2JqZWN0LCBjb250YWluZXIsIDEpO1xuXG4gIHJldHVybiBjb250YWluZXI7XG59O1xuXG4vKlxuPGJveFR5cGUgc2l6ZT1cIjEwMFwiIGZsYWdzPlxuICA8cHJvcGVydGllcz5cbiAgICA8bmFtZT48L25hbWU+PHZhbHVlPjwvdmFsdWU+XG4gICAgPG5hbWU+PC9uYW1lPjx2YWx1ZT48L3ZhbHVlPlxuICA8L3Byb3BlcnRpZXM+XG4gIDxib3hlcz5cbiAgPC9ib3hlcz5cbjwvYm94VHlwZT5cbiovXG5cbmNvbnN0IGRvbWlmeUJveCA9IGZ1bmN0aW9uIChib3gsIHBhcmVudE5vZGUsIGRlcHRoKSB7XG4gIHZhciBpc09iamVjdCA9IChvKSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnc2l6ZScsICdmbGFncycsICd0eXBlJywgJ3ZlcnNpb24nXTtcbiAgdmFyIHNwZWNpYWxQcm9wZXJ0aWVzID0gWydib3hlcycsICduYWxzJywgJ3NhbXBsZXMnXTtcbiAgdmFyIG9iamVjdFByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhib3gpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGJveFtrZXldKSB8fFxuICAgICAgKEFycmF5LmlzQXJyYXkoYm94W2tleV0pICYmIGlzT2JqZWN0KGJveFtrZXldWzBdKSk7XG4gIH0pO1xuICB2YXIgcHJvcGVydHlFeGNsdXNpb25zID1cbiAgICBhdHRyaWJ1dGVzXG4gICAgICAuY29uY2F0KHNwZWNpYWxQcm9wZXJ0aWVzKVxuICAgICAgLmNvbmNhdChvYmplY3RQcm9wZXJ0aWVzKTtcbiAgdmFyIHN1YlByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhib3gpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIHByb3BlcnR5RXhjbHVzaW9ucy5pbmRleE9mKGtleSkgPT09IC0xO1xuICB9KTtcblxuICB2YXIgYm94Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21wNC1ib3gnKTtcbiAgdmFyIHByb3BlcnR5Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21wNC1wcm9wZXJ0aWVzJyk7XG4gIHZhciBzdWJCb3hlc05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtYm94ZXMnKTtcbiAgdmFyIGJveFR5cGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbXA0LWJveC10eXBlJyk7XG5cbiAgaWYgKGJveC50eXBlKSB7XG4gICAgYm94VHlwZU5vZGUudGV4dENvbnRlbnQgPSBib3gudHlwZTtcblxuICAgIGlmIChkZXB0aCA+IDEpIHtcbiAgICAgIGJveFR5cGVOb2RlLmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICAgIH1cblxuICAgIGJveE5vZGUuYXBwZW5kQ2hpbGQoYm94VHlwZU5vZGUpO1xuICB9XG5cbiAgYXR0cmlidXRlcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAodHlwZW9mIGJveFtrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgYm94Tm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGtleSwgYm94W2tleV0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHN1YlByb3BlcnRpZXMubGVuZ3RoKSB7XG4gICAgc3ViUHJvcGVydGllcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIG1ha2VQcm9wZXJ0eShrZXksIGJveFtrZXldLCBwcm9wZXJ0eU5vZGUpO1xuICAgIH0pO1xuICAgIGJveE5vZGUuYXBwZW5kQ2hpbGQocHJvcGVydHlOb2RlKTtcbiAgfVxuXG4gIGlmIChib3guYm94ZXMgJiYgYm94LmJveGVzLmxlbmd0aCkge1xuICAgIGJveC5ib3hlcy5mb3JFYWNoKChzdWJCb3gpID0+IGRvbWlmeUJveChzdWJCb3gsIHN1YkJveGVzTm9kZSwgZGVwdGggKyAxKSk7XG4gICAgYm94Tm9kZS5hcHBlbmRDaGlsZChzdWJCb3hlc05vZGUpO1xuICB9IGVsc2UgaWYgKG9iamVjdFByb3BlcnRpZXMubGVuZ3RoKSB7XG4gICAgb2JqZWN0UHJvcGVydGllcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGJveFtrZXldKSkge1xuICAgICAgICBkb21pZnlCb3goe1xuICAgICAgICAgIHR5cGU6IGtleSxcbiAgICAgICAgICBib3hlczogYm94W2tleV1cbiAgICAgICAgfSxcbiAgICAgICAgc3ViQm94ZXNOb2RlLFxuICAgICAgICBkZXB0aCArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9taWZ5Qm94KGJveFtrZXldLCBzdWJCb3hlc05vZGUsIGRlcHRoICsgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYm94Tm9kZS5hcHBlbmRDaGlsZChzdWJCb3hlc05vZGUpO1xuICB9XG5cbiAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChib3hOb2RlKTtcbn07XG5cbmNvbnN0IG1ha2VQcm9wZXJ0eSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgcGFyZW50Tm9kZSkge1xuICB2YXIgbmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtbmFtZScpO1xuICB2YXIgdmFsdWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbXA0LXZhbHVlJyk7XG4gIHZhciBwcm9wZXJ0eU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtcHJvcGVydHknKTtcblxuICBuYW1lTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScsIG5hbWUpO1xuICBuYW1lTm9kZS50ZXh0Q29udGVudCA9IG5hbWU7XG5cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5KSB7XG4gICAgbGV0IHN0clZhbHVlID0gZGF0YVRvSGV4KHZhbHVlLCAnJyk7XG4gICAgbGV0IHRydW5jVmFsdWUgPSBzdHJWYWx1ZS5zbGljZSgwLCAxMDI5KTsgLy8gMjEgcm93cyBvZiAxNiBieXRlc1xuXG4gICAgaWYgKHRydW5jVmFsdWUubGVuZ3RoIDwgc3RyVmFsdWUubGVuZ3RoKSB7XG4gICAgICB0cnVuY1ZhbHVlICs9ICc8JyArICh2YWx1ZS5ieXRlTGVuZ3RoIC0gMzM2KSArICdiIHJlbWFpbmluZyBvZiAnICsgdmFsdWUuYnl0ZUxlbmd0aCArICdiIHRvdGFsPic7XG4gICAgfVxuXG4gICAgdmFsdWVOb2RlLnNldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScsIHRydW5jVmFsdWUudG9VcHBlckNhc2UoKSk7XG4gICAgdmFsdWVOb2RlLmlubmVySFRNTCA9IHRydW5jVmFsdWU7XG4gICAgdmFsdWVOb2RlLmNsYXNzTGlzdC5hZGQoJ3ByZS1saWtlJyk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBsZXQgc3RyVmFsdWUgPSAnWycgKyB2YWx1ZS5qb2luKCcsICcpICsgJ10nO1xuICAgIHZhbHVlTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnLCBzdHJWYWx1ZSk7XG4gICAgdmFsdWVOb2RlLnRleHRDb250ZW50ID0gc3RyVmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWVOb2RlLnNldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScsIHZhbHVlKTtcbiAgICB2YWx1ZU5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfVxuXG4gIHByb3BlcnR5Tm9kZS5hcHBlbmRDaGlsZChuYW1lTm9kZSk7XG4gIHByb3BlcnR5Tm9kZS5hcHBlbmRDaGlsZCh2YWx1ZU5vZGUpO1xuXG4gIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQocHJvcGVydHlOb2RlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5zcGVjdDogaW5zcGVjdE1wNCxcbiAgdGV4dGlmeTogdGV4dGlmeU1wNCxcbiAgZG9taWZ5OiBkb21pZnlNcDRcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7bmFsUGFyc2VBbm5leEJ9IGZyb20gJy4vY29tbW9uL25hbC1wYXJzZSc7XG5pbXBvcnQgZGF0YVRvSGV4IGZyb20gJy4vY29tbW9uL2RhdGEtdG8taGV4LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBNUDJUX1BBQ0tFVF9MRU5HVEggPSAxODg7IC8vIGluIGJ5dGVzXG5jb25zdCBTWU5DX0JZVEUgPSAweDQ3O1xuY29uc3QgU1RSRUFNX1RZUEVTICA9IHtcbiAgaDI2NDogMHgxYixcbiAgYWR0czogMHgwZixcbiAgbWV0YWRhdGE6IDB4MTVcbn07XG5cbi8qKlxuICogU3BsaXRzIGFuIGluY29taW5nIHN0cmVhbSBvZiBiaW5hcnkgZGF0YSBpbnRvIE1QRUctMiBUcmFuc3BvcnRcbiAqIFN0cmVhbSBwYWNrZXRzLlxuICovXG5jb25zdCBwYXJzZVRyYW5zcG9ydFN0cmVhbSA9IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gIHZhclxuICAgIHN0YXJ0SW5kZXggPSAwLFxuICAgIGVuZEluZGV4ID0gTVAyVF9QQUNLRVRfTEVOR1RILFxuICAgIGxhc3RTeW5jID0gLTEsXG4gICAgcGFja2V0cyA9IFtdO1xuXG4gIC8vIFdoaWxlIHdlIGhhdmUgZW5vdWdoIGRhdGEgZm9yIGEgcGFja2V0XG4gIHdoaWxlIChlbmRJbmRleCA8IGJ5dGVzLmJ5dGVMZW5ndGgpIHtcbiAgICAvLyBMb29rIGZvciBhIHBhaXIgb2Ygc3RhcnQgYW5kIGVuZCBzeW5jIGJ5dGVzIGluIHRoZSBkYXRhLi5cbiAgICBpZiAoYnl0ZXNbc3RhcnRJbmRleF0gPT09IFNZTkNfQllURSAmJiBieXRlc1tlbmRJbmRleF0gPT09IFNZTkNfQllURSkge1xuICAgICAgaWYgKGxhc3RTeW5jICE9PSAtMSkge1xuICAgICAgICBwYWNrZXRzLnB1c2goe1xuICAgICAgICAgIHR5cGU6J3Vua25vd24tYnl0ZXMnLFxuICAgICAgICAgIGRhdGE6IGJ5dGVzLnN1YmFycmF5KGxhc3RTeW5jLCBzdGFydEluZGV4KVxuICAgICAgICB9KTtcbiAgICAgICAgbGFzdFN5bmMgPSAtMTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgZm91bmQgYSBwYWNrZXQgc28gZW1pdCBpdCBhbmQganVtcCBvbmUgd2hvbGUgcGFja2V0IGZvcndhcmQgaW5cbiAgICAgIC8vIHRoZSBzdHJlYW1cbiAgICAgIHBhY2tldHMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0cmFuc3BvcnRzdHJlYW0tcGFja2V0JyxcbiAgICAgICAgZGF0YTogYnl0ZXMuc3ViYXJyYXkoc3RhcnRJbmRleCwgZW5kSW5kZXgpXG4gICAgICB9KTtcbiAgICAgIHN0YXJ0SW5kZXggKz0gTVAyVF9QQUNLRVRfTEVOR1RIO1xuICAgICAgZW5kSW5kZXggKz0gTVAyVF9QQUNLRVRfTEVOR1RIO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIElmIHdlIGdldCBoZXJlLCB3ZSBoYXZlIHNvbWVob3cgYmVjb21lIGRlLXN5bmNocm9uaXplZCBhbmQgd2UgbmVlZCB0byBzdGVwXG4gICAgLy8gZm9yd2FyZCBvbmUgYnl0ZSBhdCBhIHRpbWUgdW50aWwgd2UgZmluZCBhIHBhaXIgb2Ygc3luYyBieXRlcyB0aGF0IGRlbm90ZVxuICAgIC8vIGEgcGFja2V0XG4gICAgbGFzdFN5bmMgPSBzdGFydEluZGV4O1xuICAgIHN0YXJ0SW5kZXgrKztcbiAgICBlbmRJbmRleCsrO1xuICB9XG5cbiAgaWYgKHN0YXJ0SW5kZXggKyBNUDJUX1BBQ0tFVF9MRU5HVEggPT09IGJ5dGVzLmJ5dGVMZW5ndGgpIHtcbiAgICAgIC8vIFdlIGZvdW5kIGEgZmluYWwgcGFja2V0IHNvIGVtaXQgaXQgYW5kIGp1bXAgb25lIHdob2xlIHBhY2tldCBmb3J3YXJkIGluXG4gICAgICAvLyB0aGUgc3RyZWFtXG4gICAgICBwYWNrZXRzLnB1c2goe1xuICAgICAgICB0eXBlOiAndHJhbnNwb3J0c3RyZWFtLXBhY2tldCcsXG4gICAgICAgIGRhdGE6IGJ5dGVzLnN1YmFycmF5KHN0YXJ0SW5kZXgsIGVuZEluZGV4KVxuICAgICAgfSk7XG4gICAgICBzdGFydEluZGV4ICs9IE1QMlRfUEFDS0VUX0xFTkdUSDtcbiAgICAgIGVuZEluZGV4ICs9IE1QMlRfUEFDS0VUX0xFTkdUSDtcbiAgfVxuXG4gIC8vIElmIHRoZXJlIHdhcyBzb21lIGRhdGEgbGVmdCBvdmVyIGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQgdGhhdCBjb3VsZG4ndFxuICAvLyBwb3NzaWJseSBiZSBhIHdob2xlIHBhY2tldCwgZW1pdCBpdCBmb3IgY29tcGxldGVuZXNzXG4gIGlmIChzdGFydEluZGV4IDwgYnl0ZXMuYnl0ZUxlbmd0aCkge1xuICAgIHBhY2tldHMucHVzaCh7XG4gICAgICB0eXBlOid1bmtub3duLWJ5dGVzJyxcbiAgICAgIGRhdGE6IGJ5dGVzLnN1YmFycmF5KHN0YXJ0SW5kZXgpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcGFyc2VUcmFuc3BvcnRTdHJlYW1QYWNrZXRzKHBhY2tldHMpO1xufTtcblxuLyoqXG4gKiBBY2NlcHRzIGFuIE1QMlQgVHJhbnNwb3J0UGFja2V0U3RyZWFtIGFuZCBlbWl0cyBkYXRhIGV2ZW50cyB3aXRoIHBhcnNlZFxuICogZm9ybXMgb2YgdGhlIGluZGl2aWR1YWwgdHJhbnNwb3J0IHN0cmVhbSBwYWNrZXRzLlxuICovXG5jb25zdCBwYXJzZVRyYW5zcG9ydFN0cmVhbVBhY2tldHMgPSBmdW5jdGlvbihwYWNrZXRzKSB7XG4gIGxldCBwYWNrZXRzUGVuZGluZ1BtdCA9IFtdO1xuICBsZXQgcGFja2V0c1BlbmRpbmdQbXRQaWQgPSBbXTtcbiAgbGV0IHByb2dyYW1NYXBUYWJsZSA9IG51bGw7XG4gIGxldCBwbXRQaWQgPSBudWxsO1xuXG4gIGNvbnN0IHByb2Nlc3NQbXRPclBlcyA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICBpZiAocGFja2V0LnBpZCA9PT0gcG10UGlkKSB7XG4gICAgICBwYWNrZXQuY29udGVudC50eXBlID0gJ3BtdCc7XG4gICAgICBwYXJzZVBzaShwYWNrZXQpO1xuICAgIH0gZWxzZSBpZiAocHJvZ3JhbU1hcFRhYmxlID09PSBudWxsKSB7XG4gICAgICAvLyBXaGVuIHdlIGhhdmUgbm90IHNlZW4gYSBQTVQgeWV0LCBkZWZlciBmdXJ0aGVyIHByb2Nlc3Npbmcgb2ZcbiAgICAgIC8vIFBFUyBwYWNrZXRzIHVudGlsIG9uZSBoYXMgYmVlbiBwYXJzZWRcbiAgICAgIHBhY2tldHNQZW5kaW5nUG10LnB1c2gocGFja2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzc1BlcyhwYWNrZXQpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBwcm9jZXNzUGVzID0gZnVuY3Rpb24ocGFja2V0KSB7XG4gICAgcGFja2V0LmNvbnRlbnQuc3RyZWFtVHlwZSA9IHByb2dyYW1NYXBUYWJsZVtwYWNrZXQucGlkXTtcbiAgICBwYWNrZXQuY29udGVudC50eXBlID0gJ3Blcyc7XG4gIH07XG5cbiAgY29uc3QgcGFyc2VQc2kgPSBmdW5jdGlvbihwYWNrZXQpIHtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICB2YXIgcHNpID0gcGFja2V0LmNvbnRlbnQ7XG4gICAgdmFyIHBheWxvYWQgPSBwc2kuZGF0YTtcblxuICAgIC8vIFBTSSBwYWNrZXRzIG1heSBiZSBzcGxpdCBpbnRvIG11bHRpcGxlIHNlY3Rpb25zIGFuZCB0aG9zZVxuICAgIC8vIHNlY3Rpb25zIG1heSBiZSBzcGxpdCBpbnRvIG11bHRpcGxlIHBhY2tldHMuIElmIGEgUFNJXG4gICAgLy8gc2VjdGlvbiBzdGFydHMgaW4gdGhpcyBwYWNrZXQsIHRoZSBwYXlsb2FkX3VuaXRfc3RhcnRfaW5kaWNhdG9yXG4gICAgLy8gd2lsbCBiZSB0cnVlIGFuZCB0aGUgZmlyc3QgYnl0ZSBvZiB0aGUgcGF5bG9hZCB3aWxsIGluZGljYXRlXG4gICAgLy8gdGhlIG9mZnNldCBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uIHRvIHRoZSBzdGFydCBvZiB0aGVcbiAgICAvLyBzZWN0aW9uLlxuICAgIGlmIChwYWNrZXQucGF5bG9hZFVuaXRTdGFydEluZGljYXRvcikge1xuICAgICAgb2Zmc2V0ICs9IHBheWxvYWRbMF0gKyAxO1xuICAgIH1cblxuICAgIHBzaS5kYXRhID0gcGF5bG9hZC5zdWJhcnJheShvZmZzZXQpO1xuXG4gICAgaWYgKHBzaS50eXBlID09PSAncGF0Jykge1xuICAgICAgcGFyc2VQYXQocGFja2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VQbXQocGFja2V0KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcGFyc2VQYXQgPSBmdW5jdGlvbihwYWNrZXQpIHtcbiAgICBsZXQgcGF0ID0gcGFja2V0LmNvbnRlbnQ7XG4gICAgbGV0IHBheWxvYWQgPSBwYXQuZGF0YTtcblxuICAgIHBhdC5zZWN0aW9uTnVtYmVyID0gcGF5bG9hZFs3XTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICBwYXQubGFzdFNlY3Rpb25OdW1iZXIgPSBwYXlsb2FkWzhdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXG4gICAgLy8gc2tpcCB0aGUgUFNJIGhlYWRlciBhbmQgcGFyc2UgdGhlIGZpcnN0IFBNVCBlbnRyeVxuICAgIHBtdFBpZCA9IChwYXlsb2FkWzEwXSAmIDB4MUYpIDw8IDggfCBwYXlsb2FkWzExXTtcbiAgICBwYXQucG10UGlkID0gcG10UGlkO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIGFueSBwYWNrZXRzIHdhaXRpbmcgZm9yIGEgUE1UIFBJRCB0byBiZSBmb3VuZCwgcHJvY2VzcyB0aGVtIG5vd1xuICAgIHdoaWxlIChwYWNrZXRzUGVuZGluZ1BtdFBpZC5sZW5ndGgpIHtcbiAgICAgIHByb2Nlc3NQbXRPclBlcyhwYWNrZXRzUGVuZGluZ1BtdFBpZC5zaGlmdCgpKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlIG91dCB0aGUgcmVsZXZhbnQgZmllbGRzIG9mIGEgUHJvZ3JhbSBNYXAgVGFibGUgKFBNVCkuXG4gICAqIEBwYXJhbSBwYXlsb2FkIHtVaW50OEFycmF5fSB0aGUgUE1ULXNwZWNpZmljIHBvcnRpb24gb2YgYW4gTVAyVFxuICAgKiBwYWNrZXQuIFRoZSBmaXJzdCBieXRlIGluIHRoaXMgYXJyYXkgc2hvdWxkIGJlIHRoZSB0YWJsZV9pZFxuICAgKiBmaWVsZC5cbiAgICogQHBhcmFtIHBtdCB7b2JqZWN0fSB0aGUgb2JqZWN0IHRoYXQgc2hvdWxkIGJlIGRlY29yYXRlZCB3aXRoXG4gICAqIGZpZWxkcyBwYXJzZWQgZnJvbSB0aGUgUE1ULlxuICAgKi9cbiAgY29uc3QgcGFyc2VQbXQgPSBmdW5jdGlvbihwYWNrZXQpIHtcbiAgICBsZXQgcG10ID0gcGFja2V0LmNvbnRlbnQ7XG4gICAgbGV0IHBheWxvYWQgPSBwbXQuZGF0YTtcblxuICAgIHZhciBzZWN0aW9uTGVuZ3RoLCB0YWJsZUVuZCwgcHJvZ3JhbUluZm9MZW5ndGgsIG9mZnNldDtcblxuICAgIC8vIFBNVHMgY2FuIGJlIHNlbnQgYWhlYWQgb2YgdGhlIHRpbWUgd2hlbiB0aGV5IHNob3VsZCBhY3R1YWxseVxuICAgIC8vIHRha2UgZWZmZWN0LiBXZSBkb24ndCBiZWxpZXZlIHRoaXMgc2hvdWxkIGV2ZXIgYmUgdGhlIGNhc2VcbiAgICAvLyBmb3IgSExTIGJ1dCB3ZSdsbCBpZ25vcmUgXCJmb3J3YXJkXCIgUE1UIGRlY2xhcmF0aW9ucyBpZiB3ZSBzZWVcbiAgICAvLyB0aGVtLiBGdXR1cmUgUE1UIGRlY2xhcmF0aW9ucyBoYXZlIHRoZSBjdXJyZW50X25leHRfaW5kaWNhdG9yXG4gICAgLy8gc2V0IHRvIHplcm8uXG4gICAgaWYgKCEocGF5bG9hZFs1XSAmIDB4MDEpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gb3ZlcndyaXRlIGFueSBleGlzdGluZyBwcm9ncmFtIG1hcCB0YWJsZVxuICAgIHByb2dyYW1NYXBUYWJsZSA9IHt9O1xuXG4gICAgLy8gdGhlIG1hcHBpbmcgdGFibGUgZW5kcyBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHNlY3Rpb25cbiAgICBzZWN0aW9uTGVuZ3RoID0gKHBheWxvYWRbMV0gJiAweDBmKSA8PCA4IHwgcGF5bG9hZFsyXTtcbiAgICB0YWJsZUVuZCA9IDMgKyBzZWN0aW9uTGVuZ3RoIC0gNDtcblxuICAgIC8vIHRvIGRldGVybWluZSB3aGVyZSB0aGUgdGFibGUgaXMsIHdlIGhhdmUgdG8gZmlndXJlIG91dCBob3dcbiAgICAvLyBsb25nIHRoZSBwcm9ncmFtIGluZm8gZGVzY3JpcHRvcnMgYXJlXG4gICAgcHJvZ3JhbUluZm9MZW5ndGggPSAocGF5bG9hZFsxMF0gJiAweDBmKSA8PCA4IHwgcGF5bG9hZFsxMV07XG5cbiAgICAvLyBhZHZhbmNlIHRoZSBvZmZzZXQgdG8gdGhlIGZpcnN0IGVudHJ5IGluIHRoZSBtYXBwaW5nIHRhYmxlXG4gICAgb2Zmc2V0ID0gMTIgKyBwcm9ncmFtSW5mb0xlbmd0aDtcbiAgICB3aGlsZSAob2Zmc2V0IDwgdGFibGVFbmQpIHtcbiAgICAgIC8vIGFkZCBhbiBlbnRyeSB0aGF0IG1hcHMgdGhlIGVsZW1lbnRhcnlfcGlkIHRvIHRoZSBzdHJlYW1fdHlwZVxuICAgICAgcHJvZ3JhbU1hcFRhYmxlWyhwYXlsb2FkW29mZnNldCArIDFdICYgMHgxRikgPDwgOCB8IHBheWxvYWRbb2Zmc2V0ICsgMl1dID0gcGF5bG9hZFtvZmZzZXRdO1xuXG4gICAgICAvLyBtb3ZlIHRvIHRoZSBuZXh0IHRhYmxlIGVudHJ5XG4gICAgICAvLyBza2lwIHBhc3QgdGhlIGVsZW1lbnRhcnkgc3RyZWFtIGRlc2NyaXB0b3JzLCBpZiBwcmVzZW50XG4gICAgICBvZmZzZXQgKz0gKChwYXlsb2FkW29mZnNldCArIDNdICYgMHgwRikgPDwgOCB8IHBheWxvYWRbb2Zmc2V0ICsgNF0pICsgNTtcbiAgICB9XG5cbiAgICAvLyByZWNvcmQgdGhlIG1hcCBvbiB0aGUgcGFja2V0IGFzIHdlbGxcbiAgICBwbXQucHJvZ3JhbU1hcFRhYmxlID0gcHJvZ3JhbU1hcFRhYmxlO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIGFueSBwYWNrZXRzIHdhaXRpbmcgZm9yIGEgUE1UIHRvIGJlIGZvdW5kLCBwcm9jZXNzIHRoZW0gbm93XG4gICAgd2hpbGUgKHBhY2tldHNQZW5kaW5nUG10Lmxlbmd0aCkge1xuICAgICAgcHJvY2Vzc1BlcyhwYWNrZXRzUGVuZGluZ1BtdC5zaGlmdCgpKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlbGl2ZXIgYSBuZXcgTVAyVCBwYWNrZXQgdG8gdGhlIHN0cmVhbS5cbiAgICovXG4gIGNvbnN0IHBhcnNlUGFja2V0ID0gZnVuY3Rpb24ocGFja2V0KSB7XG4gICAgbGV0IG9mZnNldCA9IDQ7XG4gICAgbGV0IHBheWxvYWQgPSBwYWNrZXQuZGF0YTtcbiAgICBsZXQgY29udGVudCA9IHt9O1xuXG4gICAgcGFja2V0LnBheWxvYWRVbml0U3RhcnRJbmRpY2F0b3IgPSAhIShwYXlsb2FkWzFdICYgMHg0MCk7XG5cbiAgICAvLyBwaWQgaXMgYSAxMy1iaXQgZmllbGQgc3RhcnRpbmcgYXQgdGhlIGxhc3QgYml0IG9mIHBhY2tldFsxXVxuICAgIHBhY2tldC5waWQgPSBwYXlsb2FkWzFdICYgMHgxZjtcbiAgICBwYWNrZXQucGlkIDw8PSA4O1xuICAgIHBhY2tldC5waWQgfD0gcGF5bG9hZFsyXTtcbiAgICBwYWNrZXQuY29udGVudCA9IGNvbnRlbnQ7XG5cbiAgICAvLyBpZiBhbiBhZGFwdGlvbiBmaWVsZCBpcyBwcmVzZW50LCBpdHMgbGVuZ3RoIGlzIHNwZWNpZmllZCBieSB0aGVcbiAgICAvLyBmaWZ0aCBieXRlIG9mIHRoZSBUUyBwYWNrZXQgaGVhZGVyLiBUaGUgYWRhcHRhdGlvbiBmaWVsZCBpc1xuICAgIC8vIHVzZWQgdG8gYWRkIHN0dWZmaW5nIHRvIFBFUyBwYWNrZXRzIHRoYXQgZG9uJ3QgZmlsbCBhIGNvbXBsZXRlXG4gICAgLy8gVFMgcGFja2V0LCBhbmQgdG8gc3BlY2lmeSBzb21lIGZvcm1zIG9mIHRpbWluZyBhbmQgY29udHJvbCBkYXRhXG4gICAgLy8gdGhhdCB3ZSBkbyBub3QgY3VycmVudGx5IHVzZS5cbiAgICBpZiAoKChwYXlsb2FkWzNdICYgMHgzMCkgPj4+IDQpID4gMHgwMSkge1xuICAgICAgb2Zmc2V0ICs9IHBheWxvYWRbb2Zmc2V0XSArIDE7XG4gICAgfVxuXG4gICAgY29udGVudC5kYXRhID0gcGF5bG9hZC5zdWJhcnJheShvZmZzZXQpO1xuXG4gICAgLy8gcGFyc2UgdGhlIHJlc3Qgb2YgdGhlIHBhY2tldCBiYXNlZCBvbiB0aGUgdHlwZVxuICAgIGlmIChwYWNrZXQucGlkID09PSAwKSB7XG4gICAgICBjb250ZW50LnR5cGUgPSAncGF0JztcbiAgICAgIHBhcnNlUHNpKHBhY2tldCk7XG4gICAgICByZXR1cm4gcGFja2V0O1xuICAgIH1cblxuICAgIGlmIChwbXRQaWQgPT09IG51bGwpIHtcbiAgICAgIHBhY2tldHNQZW5kaW5nUG10UGlkLnB1c2gocGFja2V0KTtcbiAgICAgIHJldHVybiBwYWNrZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NQbXRPclBlcyhwYWNrZXQpO1xuICB9O1xuXG4gIHBhY2tldHNcbiAgICAuZmlsdGVyKChwYWNrZXQpID0+IHBhY2tldC50eXBlID09PSAndHJhbnNwb3J0c3RyZWFtLXBhY2tldCcpXG4gICAgLmZvckVhY2goKHBhY2tldCkgPT4ge1xuICAgICAgaWYgKHBhY2tldC50eXBlID09PSAndHJhbnNwb3J0c3RyZWFtLXBhY2tldCcpIHtcbiAgICAgICAgcGFyc2VQYWNrZXQocGFja2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhY2tldC5jb250ZW50ID0ge307XG4gICAgICB9XG4gICAgfSk7XG5cbiAgcmV0dXJuIHBhY2tldHM7XG59O1xuXG4vKipcbiAqIFJlY29uc2lzdHV0ZXMgcHJvZ3JhbSBlbGVtZW50YXJ5IHN0cmVhbSAoUEVTKSBwYWNrZXRzIGZyb20gcGFyc2VkXG4gKiB0cmFuc3BvcnQgc3RyZWFtIHBhY2tldHMuIFRoYXQgaXMsIGlmIHlvdSBwaXBlIGFuXG4gKiBtcDJ0LlRyYW5zcG9ydFBhcnNlU3RyZWFtIGludG8gYSBtcDJ0LkVsZW1lbnRhcnlTdHJlYW0sIHRoZSBvdXRwdXRcbiAqIGV2ZW50cyB3aWxsIGJlIGV2ZW50cyB3aGljaCBjYXB0dXJlIHRoZSBieXRlcyBmb3IgaW5kaXZpZHVhbCBQRVNcbiAqIHBhY2tldHMgcGx1cyByZWxldmFudCBtZXRhZGF0YSB0aGF0IGhhcyBiZWVuIGV4dHJhY3RlZCBmcm9tIHRoZVxuICogY29udGFpbmVyLlxuICovXG5jb25zdCBwYXJzZVBlc1BhY2tldHMgPSBmdW5jdGlvbihwYWNrZXRzKSB7XG4gIHZhclxuICAgIGNvbXBsZXRlRXMgPSBbXSxcbiAgICAvLyBQRVMgcGFja2V0IGZyYWdtZW50c1xuICAgIHZpZGVvID0ge1xuICAgICAgZGF0YTogW10sXG4gICAgICB0c1BhY2tldEluZGljZXM6IFtdLFxuICAgICAgc2l6ZTogMFxuICAgIH0sXG4gICAgYXVkaW8gPSB7XG4gICAgICBkYXRhOiBbXSxcbiAgICAgIHRzUGFja2V0SW5kaWNlczogW10sXG4gICAgICBzaXplOiAwXG4gICAgfSxcbiAgICB0aW1lZE1ldGFkYXRhID0ge1xuICAgICAgZGF0YTogW10sXG4gICAgICB0c1BhY2tldEluZGljZXM6IFtdLFxuICAgICAgc2l6ZTogMFxuICAgIH0sXG4gICAgcGFyc2VQZXMgPSBmdW5jdGlvbihwYXlsb2FkLCBwZXMpIHtcbiAgICAgIHZhciBwdHNEdHNGbGFncztcblxuICAgICAgLy8gZmluZCBvdXQgaWYgdGhpcyBwYWNrZXRzIHN0YXJ0cyBhIG5ldyBrZXlmcmFtZVxuICAgICAgcGVzLmRhdGFBbGlnbm1lbnRJbmRpY2F0b3IgPSAocGF5bG9hZFs2XSAmIDB4MDQpICE9PSAwO1xuICAgICAgLy8gUEVTIHBhY2tldHMgbWF5IGJlIGFubm90YXRlZCB3aXRoIGEgUFRTIHZhbHVlLCBvciBhIFBUUyB2YWx1ZVxuICAgICAgLy8gYW5kIGEgRFRTIHZhbHVlLiBEZXRlcm1pbmUgd2hhdCBjb21iaW5hdGlvbiBvZiB2YWx1ZXMgaXNcbiAgICAgIC8vIGF2YWlsYWJsZSB0byB3b3JrIHdpdGguXG4gICAgICBwdHNEdHNGbGFncyA9IHBheWxvYWRbN107XG5cbiAgICAgIC8vIFBUUyBhbmQgRFRTIGFyZSBub3JtYWxseSBzdG9yZWQgYXMgYSAzMy1iaXQgbnVtYmVyLiAgSmF2YXNjcmlwdFxuICAgICAgLy8gcGVyZm9ybXMgYWxsIGJpdHdpc2Ugb3BlcmF0aW9ucyBvbiAzMi1iaXQgaW50ZWdlcnMgYnV0IGphdmFzY3JpcHRcbiAgICAgIC8vIHN1cHBvcnRzIGEgbXVjaCBncmVhdGVyIHJhbmdlICg1Mi1iaXRzKSBvZiBpbnRlZ2VyIHVzaW5nIHN0YW5kYXJkXG4gICAgICAvLyBtYXRoZW1hdGljYWwgb3BlcmF0aW9ucy5cbiAgICAgIC8vIFdlIGNvbnN0cnVjdCBhIDMxLWJpdCB2YWx1ZSB1c2luZyBiaXR3aXNlIG9wZXJhdG9ycyBvdmVyIHRoZSAzMVxuICAgICAgLy8gbW9zdCBzaWduaWZpY2FudCBiaXRzIGFuZCB0aGVuIG11bHRpcGx5IGJ5IDQgKGVxdWFsIHRvIGEgbGVmdC1zaGlmdFxuICAgICAgLy8gb2YgMikgYmVmb3JlIHdlIGFkZCB0aGUgZmluYWwgMiBsZWFzdCBzaWduaWZpY2FudCBiaXRzIG9mIHRoZVxuICAgICAgLy8gdGltZXN0YW1wIChlcXVhbCB0byBhbiBPUi4pXG4gICAgICBpZiAocHRzRHRzRmxhZ3MgJiAweEMwKSB7XG4gICAgICAgIC8vIHRoZSBQVFMgYW5kIERUUyBhcmUgbm90IHdyaXR0ZW4gb3V0IGRpcmVjdGx5LiBGb3IgaW5mb3JtYXRpb25cbiAgICAgICAgLy8gb24gaG93IHRoZXkgYXJlIGVuY29kZWQsIHNlZVxuICAgICAgICAvLyBodHRwOi8vZHZkLnNvdXJjZWZvcmdlLm5ldC9kdmRpbmZvL3Blcy1oZHIuaHRtbFxuICAgICAgICBwZXMucHRzID0gKHBheWxvYWRbOV0gJiAweDBFKSA8PCAyNyB8XG4gICAgICAgICAgKHBheWxvYWRbMTBdICYgMHhGRikgPDwgMjAgfFxuICAgICAgICAgIChwYXlsb2FkWzExXSAmIDB4RkUpIDw8IDEyIHxcbiAgICAgICAgICAocGF5bG9hZFsxMl0gJiAweEZGKSA8PCAgNSB8XG4gICAgICAgICAgKHBheWxvYWRbMTNdICYgMHhGRSkgPj4+ICAzO1xuICAgICAgICBwZXMucHRzICo9IDQ7IC8vIExlZnQgc2hpZnQgYnkgMlxuICAgICAgICBwZXMucHRzICs9IChwYXlsb2FkWzEzXSAmIDB4MDYpID4+PiAxOyAvLyBPUiBieSB0aGUgdHdvIExTQnNcbiAgICAgICAgcGVzLmR0cyA9IHBlcy5wdHM7XG4gICAgICAgIGlmIChwdHNEdHNGbGFncyAmIDB4NDApIHtcbiAgICAgICAgICBwZXMuZHRzID0gKHBheWxvYWRbMTRdICYgMHgwRSkgPDwgMjcgfFxuICAgICAgICAgICAgKHBheWxvYWRbMTVdICYgMHhGRikgPDwgMjAgfFxuICAgICAgICAgICAgKHBheWxvYWRbMTZdICYgMHhGRSkgPDwgMTIgfFxuICAgICAgICAgICAgKHBheWxvYWRbMTddICYgMHhGRikgPDwgNSB8XG4gICAgICAgICAgICAocGF5bG9hZFsxOF0gJiAweEZFKSA+Pj4gMztcbiAgICAgICAgICBwZXMuZHRzICo9IDQ7IC8vIExlZnQgc2hpZnQgYnkgMlxuICAgICAgICAgIHBlcy5kdHMgKz0gKHBheWxvYWRbMThdICYgMHgwNikgPj4+IDE7IC8vIE9SIGJ5IHRoZSB0d28gTFNCc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBkYXRhIHNlY3Rpb24gc3RhcnRzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBQRVMgaGVhZGVyLlxuICAgICAgLy8gcGVzX2hlYWRlcl9kYXRhX2xlbmd0aCBzcGVjaWZpZXMgdGhlIG51bWJlciBvZiBoZWFkZXIgYnl0ZXNcbiAgICAgIC8vIHRoYXQgZm9sbG93IHRoZSBsYXN0IGJ5dGUgb2YgdGhlIGZpZWxkLlxuICAgICAgcGVzLmRhdGEgPSBwYXlsb2FkLnN1YmFycmF5KDkgKyBwYXlsb2FkWzhdKTtcbiAgICB9LFxuICAgIGZsdXNoU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtLCB0eXBlKSB7XG4gICAgICB2YXJcbiAgICAgICAgcGFja2V0RGF0YSA9IG5ldyBVaW50OEFycmF5KHN0cmVhbS5zaXplKSxcbiAgICAgICAgZXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICB9LFxuICAgICAgICBpID0gMCxcbiAgICAgICAgZnJhZ21lbnQ7XG5cbiAgICAgIC8vIGRvIG5vdGhpbmcgaWYgdGhlcmUgaXMgbm8gYnVmZmVyZWQgZGF0YVxuICAgICAgaWYgKCFzdHJlYW0uZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZXZlbnQucGlkID0gc3RyZWFtLnBpZDtcbiAgICAgIGV2ZW50LnBhY2tldENvdW50ID0gc3RyZWFtLmRhdGEubGVuZ3RoO1xuICAgICAgZXZlbnQudHNQYWNrZXRJbmRpY2VzID0gc3RyZWFtLnRzUGFja2V0SW5kaWNlcztcbiAgICAgIC8vIHJlYXNzZW1ibGUgdGhlIHBhY2tldFxuICAgICAgd2hpbGUgKHN0cmVhbS5kYXRhLmxlbmd0aCkge1xuICAgICAgICBmcmFnbWVudCA9IHN0cmVhbS5kYXRhLnNoaWZ0KCk7XG5cbiAgICAgICAgcGFja2V0RGF0YS5zZXQoZnJhZ21lbnQuZGF0YSwgaSk7XG4gICAgICAgIGkgKz0gZnJhZ21lbnQuZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICAvLyBwYXJzZSBhc3NlbWJsZWQgcGFja2V0J3MgUEVTIGhlYWRlclxuICAgICAgcGFyc2VQZXMocGFja2V0RGF0YSwgZXZlbnQpO1xuXG4gICAgICBzdHJlYW0uc2l6ZSA9IDA7XG4gICAgICBzdHJlYW0udHNQYWNrZXRJbmRpY2VzID0gW107XG5cbiAgICAgIGNvbXBsZXRlRXMucHVzaChldmVudCk7XG4gICAgfTtcblxuICBjb25zdCBwYWNrZXRUeXBlcyA9IHtcbiAgICBwYXQ6IGZ1bmN0aW9uKHBhY2tldCwgcGFja2V0SW5kZXgpIHtcbiAgICAgIGxldCBwYXQgPSBwYWNrZXQuY29udGVudDtcbiAgICAgIGNvbXBsZXRlRXMucHVzaCh7XG4gICAgICAgIHBpZDogcGFja2V0LnBpZCxcbiAgICAgICAgdHlwZTogJ3BhdCcsXG4gICAgICAgIHBhY2tldENvdW50OiAxLFxuICAgICAgICBzZWN0aW9uTnVtYmVyOiBwYXQuc2VjdGlvbk51bWJlcixcbiAgICAgICAgbGFzdFNlY3Rpb25OdW1iZXI6IHBhdC5sYXN0U2VjdGlvbk51bWJlcixcbiAgICAgICAgdHNQYWNrZXRJbmRpY2VzOiBbcGFja2V0SW5kZXhdLFxuICAgICAgICBwbXRQaWQ6IHBhdC5wbXRQaWQsXG4gICAgICAgIGRhdGE6IHBhdC5kYXRhXG4gICAgICB9KTtcbiAgICB9LFxuICAgIHBlczogZnVuY3Rpb24ocGFja2V0LCBwYWNrZXRJbmRleCkge1xuICAgICAgbGV0IHN0cmVhbTtcbiAgICAgIGxldCBzdHJlYW1UeXBlO1xuICAgICAgbGV0IHBlcyA9IHBhY2tldC5jb250ZW50O1xuXG4gICAgICBzd2l0Y2ggKHBlcy5zdHJlYW1UeXBlKSB7XG4gICAgICBjYXNlIFNUUkVBTV9UWVBFUy5oMjY0OlxuICAgICAgICBzdHJlYW0gPSB2aWRlbztcbiAgICAgICAgc3RyZWFtVHlwZSA9ICd2aWRlbyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVFJFQU1fVFlQRVMuYWR0czpcbiAgICAgICAgc3RyZWFtID0gYXVkaW87XG4gICAgICAgIHN0cmVhbVR5cGUgPSAnYXVkaW8nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RSRUFNX1RZUEVTLm1ldGFkYXRhOlxuICAgICAgICBzdHJlYW0gPSB0aW1lZE1ldGFkYXRhO1xuICAgICAgICBzdHJlYW1UeXBlID0gJ3RpbWVkLW1ldGFkYXRhJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBpZ25vcmUgdW5rbm93biBzdHJlYW0gdHlwZXNcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiBhIG5ldyBwYWNrZXQgaXMgc3RhcnRpbmcsIHdlIGNhbiBmbHVzaCB0aGUgY29tcGxldGVkXG4gICAgICAvLyBwYWNrZXRcbiAgICAgIGlmIChwYWNrZXQucGF5bG9hZFVuaXRTdGFydEluZGljYXRvcikge1xuICAgICAgICBmbHVzaFN0cmVhbShzdHJlYW0sIHN0cmVhbVR5cGUpO1xuICAgICAgfVxuXG4gICAgICBzdHJlYW0ucGlkID0gcGFja2V0LnBpZDtcbiAgICAgIHN0cmVhbS50c1BhY2tldEluZGljZXMucHVzaChwYWNrZXRJbmRleCk7XG4gICAgICAvLyBidWZmZXIgdGhpcyBmcmFnbWVudCB1bnRpbCB3ZSBhcmUgc3VyZSB3ZSd2ZSByZWNlaXZlZCB0aGVcbiAgICAgIC8vIGNvbXBsZXRlIHBheWxvYWRcbiAgICAgIHN0cmVhbS5kYXRhLnB1c2gocGVzKTtcbiAgICAgIHN0cmVhbS5zaXplICs9IHBlcy5kYXRhLmJ5dGVMZW5ndGg7XG4gICAgfSxcbiAgICBwbXQ6IGZ1bmN0aW9uKHBhY2tldCwgcGFja2V0SW5kZXgpIHtcbiAgICAgIGxldCBwbXQgPSBwYWNrZXQuY29udGVudDtcbiAgICAgIGxldCBwcm9ncmFtTWFwVGFibGUgPSBwbXQucHJvZ3JhbU1hcFRhYmxlO1xuICAgICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICBwaWQ6IHBhY2tldC5waWQsXG4gICAgICAgIHR5cGU6ICdwbXQnLFxuICAgICAgICB0cmFja3M6IFtdLFxuICAgICAgICB0c1BhY2tldEluZGljZXM6IFtwYWNrZXRJbmRleF0sXG4gICAgICAgIHBhY2tldENvdW50OiAxLFxuICAgICAgICBkYXRhOiBwbXQuZGF0YVxuICAgICAgfTtcbiAgICAgIGxldCBrO1xuICAgICAgbGV0IHRyYWNrO1xuXG4gICAgICAvLyB0cmFuc2xhdGUgc3RyZWFtcyB0byB0cmFja3NcbiAgICAgIGZvciAoayBpbiBwcm9ncmFtTWFwVGFibGUpIHtcbiAgICAgICAgaWYgKHByb2dyYW1NYXBUYWJsZS5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIHRyYWNrID0ge307XG5cbiAgICAgICAgICB0cmFjay5pZCA9ICtrO1xuICAgICAgICAgIGlmIChwcm9ncmFtTWFwVGFibGVba10gPT09IFNUUkVBTV9UWVBFUy5oMjY0KSB7XG4gICAgICAgICAgICB0cmFjay5jb2RlYyA9ICdhdmMnO1xuICAgICAgICAgICAgdHJhY2sudHlwZSA9ICd2aWRlbyc7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcm9ncmFtTWFwVGFibGVba10gPT09IFNUUkVBTV9UWVBFUy5hZHRzKSB7XG4gICAgICAgICAgICB0cmFjay5jb2RlYyA9ICdhZHRzJztcbiAgICAgICAgICAgIHRyYWNrLnR5cGUgPSAnYXVkaW8nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC50cmFja3MucHVzaCh0cmFjayk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbXBsZXRlRXMucHVzaChldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHBhcnNlUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCwgcGFja2V0SW5kZXgpIHtcbiAgICBzd2l0Y2ggKHBhY2tldC5jb250ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgJ3BhdCc6XG4gICAgICBjYXNlICdwbXQnOlxuICAgICAgY2FzZSAncGVzJzpcbiAgICAgICAgcGFja2V0VHlwZXNbcGFja2V0LmNvbnRlbnQudHlwZV0ocGFja2V0LCBwYWNrZXRJbmRleCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuXG4gIHBhY2tldHMuZm9yRWFjaCgocGFja2V0LCBwYWNrZXRJbmRleCkgPT4ge1xuICAgIHBhcnNlUGFja2V0KHBhY2tldCwgcGFja2V0SW5kZXgpO1xuICB9KTtcblxuICBmbHVzaFN0cmVhbSh2aWRlbywgJ3ZpZGVvJyk7XG4gIGZsdXNoU3RyZWFtKGF1ZGlvLCAnYXVkaW8nKTtcbiAgZmx1c2hTdHJlYW0odGltZWRNZXRhZGF0YSwgJ3RpbWVkLW1ldGFkYXRhJyk7XG5cbiAgcmV0dXJuIGNvbXBsZXRlRXM7XG59O1xuXG5jb25zdCBpbnNwZWN0VHMgPSBmdW5jdGlvbiAoZGF0YSkge1xuICB2YXIgb2JqZWN0ID0ge307XG4gIHZhciB0c1BhY2tldHMgPSBwYXJzZVRyYW5zcG9ydFN0cmVhbShkYXRhKTtcbiAgdmFyIHBlc1BhY2tldHMgPSBwYXJzZVBlc1BhY2tldHModHNQYWNrZXRzKTtcblxuICBvYmplY3QudHNNYXAgPSB0c1BhY2tldHM7XG4gIG9iamVjdC5lc01hcCA9IHBlc1BhY2tldHM7XG5cbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cbmNvbnN0IGRvbWlmeVRzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICBsZXQgdHNQYWNrZXRzID0gb2JqZWN0LnRzTWFwO1xuICBsZXQgcGVzUGFja2V0cyA9IG9iamVjdC5lc01hcDtcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gIHBhcnNlUEVTUGFja2V0cyhwZXNQYWNrZXRzLCBjb250YWluZXIsIDEpO1xuXG4gIHJldHVybiBjb250YWluZXI7XG59O1xuXG5jb25zdCBwYXJzZVBFU1BhY2tldHMgPSBmdW5jdGlvbiAocGVzUGFja2V0cywgcGFyZW50LCBkZXB0aCkge1xuICBwZXNQYWNrZXRzLmZvckVhY2goKHBhY2tldCkgPT4ge1xuICAgIHZhciBwYWNrZXRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRvbWlmeUJveChwYXJzZU5hbHMocGFja2V0KSwgcGFyZW50LCBkZXB0aCArIDEpO1xuICB9KTtcbn07XG5cbmNvbnN0IHBhcnNlTmFscyA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgaWYgKHBhY2tldC50eXBlID09PSAndmlkZW8nKSB7XG4gICAgcGFja2V0Lm5hbHMgPSBuYWxQYXJzZUFubmV4QihwYWNrZXQuZGF0YSk7XG4gIH1cbiAgcmV0dXJuIHBhY2tldDtcbn07XG5cbmNvbnN0IGRvbWlmeUJveCA9IGZ1bmN0aW9uIChib3gsIHBhcmVudE5vZGUsIGRlcHRoKSB7XG4gIHZhciBpc09iamVjdCA9IChvKSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnc2l6ZScsICdmbGFncycsICd0eXBlJywgJ3ZlcnNpb24nXTtcbiAgdmFyIHNwZWNpYWxQcm9wZXJ0aWVzID0gWydib3hlcycsICduYWxzJywgJ3NhbXBsZXMnLCAncGFja2V0Q291bnQnXTtcbiAgdmFyIG9iamVjdFByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhib3gpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGJveFtrZXldKSB8fFxuICAgICAgKEFycmF5LmlzQXJyYXkoYm94W2tleV0pICYmIGlzT2JqZWN0KGJveFtrZXldWzBdKSk7XG4gIH0pO1xuICB2YXIgcHJvcGVydHlFeGNsdXNpb25zID1cbiAgICBhdHRyaWJ1dGVzXG4gICAgICAuY29uY2F0KHNwZWNpYWxQcm9wZXJ0aWVzKVxuICAgICAgLmNvbmNhdChvYmplY3RQcm9wZXJ0aWVzKTtcbiAgdmFyIHN1YlByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhib3gpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIHByb3BlcnR5RXhjbHVzaW9ucy5pbmRleE9mKGtleSkgPT09IC0xO1xuICB9KTtcblxuICB2YXIgYm94Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21wNC1ib3gnKTtcbiAgdmFyIHByb3BlcnR5Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21wNC1wcm9wZXJ0aWVzJyk7XG4gIHZhciBzdWJCb3hlc05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtYm94ZXMnKTtcbiAgdmFyIGJveFR5cGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbXA0LWJveC10eXBlJyk7XG5cbiAgaWYgKGJveC50eXBlKSB7XG4gICAgYm94VHlwZU5vZGUudGV4dENvbnRlbnQgPSBib3gudHlwZTtcblxuICAgIGlmIChkZXB0aCA+IDEpIHtcbiAgICAgIGJveFR5cGVOb2RlLmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuICAgIH1cblxuICAgIGJveE5vZGUuYXBwZW5kQ2hpbGQoYm94VHlwZU5vZGUpO1xuICB9XG5cbiAgYXR0cmlidXRlcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAodHlwZW9mIGJveFtrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgYm94Tm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGtleSwgYm94W2tleV0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHN1YlByb3BlcnRpZXMubGVuZ3RoKSB7XG4gICAgc3ViUHJvcGVydGllcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIG1ha2VQcm9wZXJ0eShrZXksIGJveFtrZXldLCBwcm9wZXJ0eU5vZGUpO1xuICAgIH0pO1xuICAgIGJveE5vZGUuYXBwZW5kQ2hpbGQocHJvcGVydHlOb2RlKTtcbiAgfVxuXG4gIGlmIChib3guYm94ZXMgJiYgYm94LmJveGVzLmxlbmd0aCkge1xuICAgIGJveC5ib3hlcy5mb3JFYWNoKChzdWJCb3gpID0+IGRvbWlmeUJveChzdWJCb3gsIHN1YkJveGVzTm9kZSwgZGVwdGggKyAxKSk7XG4gICAgYm94Tm9kZS5hcHBlbmRDaGlsZChzdWJCb3hlc05vZGUpO1xuICB9IGVsc2UgaWYgKG9iamVjdFByb3BlcnRpZXMubGVuZ3RoKSB7XG4gICAgb2JqZWN0UHJvcGVydGllcy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGJveFtrZXldKSkge1xuICAgICAgICBkb21pZnlCb3goe1xuICAgICAgICAgIHR5cGU6IGtleSxcbiAgICAgICAgICBib3hlczogYm94W2tleV1cbiAgICAgICAgfSxcbiAgICAgICAgc3ViQm94ZXNOb2RlLFxuICAgICAgICBkZXB0aCArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9taWZ5Qm94KGJveFtrZXldLCBzdWJCb3hlc05vZGUsIGRlcHRoICsgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYm94Tm9kZS5hcHBlbmRDaGlsZChzdWJCb3hlc05vZGUpO1xuICB9XG5cbiAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChib3hOb2RlKTtcbn07XG5cbmNvbnN0IG1ha2VQcm9wZXJ0eSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgcGFyZW50Tm9kZSkge1xuICB2YXIgbmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtbmFtZScpO1xuICB2YXIgdmFsdWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbXA0LXZhbHVlJyk7XG4gIHZhciBwcm9wZXJ0eU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtcDQtcHJvcGVydHknKTtcblxuICBuYW1lTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScsIG5hbWUpO1xuICBuYW1lTm9kZS50ZXh0Q29udGVudCA9IG5hbWU7XG5cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5KSB7XG4gICAgbGV0IHN0clZhbHVlID0gZGF0YVRvSGV4KHZhbHVlLCAnJyk7XG4gICAgbGV0IHRydW5jVmFsdWUgPSBzdHJWYWx1ZS5zbGljZSgwLCAxMDI5KTsgLy8gMjEgcm93cyBvZiAxNiBieXRlc1xuXG4gICAgaWYgKHRydW5jVmFsdWUubGVuZ3RoIDwgc3RyVmFsdWUubGVuZ3RoKSB7XG4gICAgICB0cnVuY1ZhbHVlICs9ICc8JyArICh2YWx1ZS5ieXRlTGVuZ3RoIC0gMzM2KSArICdiIHJlbWFpbmluZyBvZiAnICsgdmFsdWUuYnl0ZUxlbmd0aCArICdiIHRvdGFsPic7XG4gICAgfVxuXG4gICAgdmFsdWVOb2RlLnNldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScsIHRydW5jVmFsdWUudG9VcHBlckNhc2UoKSk7XG4gICAgdmFsdWVOb2RlLmlubmVySFRNTCA9IHRydW5jVmFsdWU7XG4gICAgdmFsdWVOb2RlLmNsYXNzTGlzdC5hZGQoJ3ByZS1saWtlJyk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBsZXQgc3RyVmFsdWUgPSAnWycgKyB2YWx1ZS5qb2luKCcsICcpICsgJ10nO1xuICAgIHZhbHVlTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnLCBzdHJWYWx1ZSk7XG4gICAgdmFsdWVOb2RlLnRleHRDb250ZW50ID0gc3RyVmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWVOb2RlLnNldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScsIHZhbHVlKTtcbiAgICB2YWx1ZU5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfVxuXG4gIHByb3BlcnR5Tm9kZS5hcHBlbmRDaGlsZChuYW1lTm9kZSk7XG4gIHByb3BlcnR5Tm9kZS5hcHBlbmRDaGlsZCh2YWx1ZU5vZGUpO1xuXG4gIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQocHJvcGVydHlOb2RlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5zcGVjdDogaW5zcGVjdFRzLFxuICBkb21pZnk6IGRvbWlmeVRzXG59O1xuIl19
