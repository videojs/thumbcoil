/**
 * Tools for encoding and decoding ExpGolomb data from a bit-string
 */
'use strict';

export const ExpGolombDecoder = function (bitString) {
  this.bitReservoir = bitString;
};

ExpGolombDecoder.prototype.countLeadingZeros = function () {
  let i = 0;

  for (let i = 0; i < this.bitReservoir.length; i++) {
    if (this.bitReservoir[i] === '1') {
      return i;
    }
  }

  return -1;
};

ExpGolombDecoder.prototype.readUnsignedExpGolomb = function () {
  let zeros = this.countLeadingZeros();
  let bitCount = zeros * 2 + 1;

  let val = parseInt(this.bitReservoir.slice(zeros, bitCount), 2);

  val -= 1;

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readExpGolomb = function () {
  let val = this.readUnsignedExpGolomb();

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
  let val = parseInt(this.bitReservoir.slice(0, bitCount), 2);

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};


ExpGolombDecoder.prototype.readUnsignedByte = function () {
  return this.writeBits(8);
};

export const ExpGolombEncoder = function (bitString) {
  this.bitReservoir = bitString || '';
};

ExpGolombEncoder.prototype.writeUnsignedExpGolomb = function (value) {
  let tempStr = '';
  let bitValue = (value + 1).toString(2);
  let numBits = bitValue.length - 1;

  for (let i = 0; i < numBits; i++) {
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
  let tempStr = '';
  let bitValue = (value & ((1 << bitWidth)-1)).toString(2);
  let numBits = bitWidth - bitValue.length;

  for (let i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + bitValue;
};

ExpGolombEncoder.prototype.writeUnsignedByte = function (value) {
  this.writeBits(8, value);
};
