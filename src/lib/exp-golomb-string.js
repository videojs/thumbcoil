/**
 * Tools for encoding and decoding ExpGolomb data from a bit-string
 */
'use strict';

export const ExpGolombDecoder = function (bitString) {
  this.bitReservoir = bitString;
  this.originalBitReservoir = bitString;
};

ExpGolombDecoder.prototype.byteAlign = function () {
  let byteBoundary = Math.ceil((this.originalBitReservoir.length - this.bitReservoir.length) / 8) * 8;
  let bitsLeft = this.originalBitReservoir.length - byteBoundary;
  let bitsToRemove = this.bitReservoir.length - bitsLeft;

  return this.readRawBits(bitsToRemove);
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
  let bitCount = zeros + 1;

  if (zeros === -1) {
    throw new Error('Error reading exp-golomb value.');
  }
  // Throw away the leading-zeros
  this.readBits(zeros);
  let val = this.readBits(bitCount);

  val -= 1;

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
  if (this.bitReservoir.length < bitCount) {
    throw new Error(`Error reading bit stream value expected (${bitCount}) bits remaining but found (${this.bitReservoir.length})`);
  }

  let val = parseInt(this.bitReservoir.slice(0, bitCount), 2);

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readRawBits = function (bitCount) {
  if (this.bitReservoir.length < bitCount) {
    throw new Error(`Error reading bit stream value expected (${bitCount}) bits remaining but found (${this.bitReservoir.length})`);
  }

  let val = this.bitReservoir.slice(0, bitCount);

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readUnsignedByte = function () {
  return this.readBits(8);
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

ExpGolombEncoder.prototype.writeRawBits = function (bitWidth, value) {
  let tempStr = '';
  let numBits = bitWidth - value.length;

  for (let i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + value;
};

ExpGolombEncoder.prototype.writeUnsignedByte = function (value) {
  this.writeBits(8, value);
};
