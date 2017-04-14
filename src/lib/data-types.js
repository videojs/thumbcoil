'use strict';

const getNumBits = (numBits, expGolomb, data, options, index) => {
  if (typeof numBits === 'function') {
    return numBits(expGolomb, data, options, index);
  }
  return numBits;
};

const dataTypes = {
  u: (numBits) => {
    return {
      read: (expGolomb, output, options, index) => {
        let bitsToRead = getNumBits(numBits, expGolomb, output, options, index);

        return expGolomb.readBits(bitsToRead);
      },
      write: (expGolomb, input, options, index, value) => {
        let bitsToWrite = getNumBits(numBits, expGolomb, input, options, index);

        expGolomb.writeBits(bitsToWrite, value);
      }
    };
  },
  f: (numBits) => {
    return {
      read: (expGolomb, output, options, index) => {
        let bitsToRead = getNumBits(numBits, expGolomb, output, options, index);

        return expGolomb.readBits(bitsToRead);
      },
      write: (expGolomb, input, options, index, value) => {
        let bitsToWrite = getNumBits(numBits, expGolomb, input, options, index);

        expGolomb.writeBits(bitsToWrite, value);
      }
    };
  },
  ue: () => {
    return {
      read: (expGolomb, output, options, index) => {
        return expGolomb.readUnsignedExpGolomb();
      },
      write: (expGolomb, input, options, index, value) => {
        expGolomb.writeUnsignedExpGolomb(value);
      }
    };
  },
  se: () => {
    return {
      read: (expGolomb, output, options, index) => {
        return expGolomb.readExpGolomb();
      },
      write: (expGolomb, input, options, index, value) => {
        expGolomb.writeExpGolomb(value);
      }
    };
  },
  b: () => {
    return {
      read: (expGolomb, output, options, index) => {
        return expGolomb.readUnsignedByte();
      },
      write: (expGolomb, input, options, index, value) => {
        expGolomb.writeUnsignedByte(value);
      }
    };
  },
  val: (val) => {
    return {
      read: (expGolomb, output, options, index) => {
        if (typeof val === 'function') {
          return val(expGolomb, output, options, index);
        }
        return val;
      },
      write: (expGolomb, input, options, index, value) => {
        if (typeof val === 'function') {
          val(ExpGolomb, output, options, index);
        }
      }
    };
  },
  byteAlign: () => {
    return {
      read: (expGolomb, output, options, index) => {
        return expGolomb.byteAlign();
      },
      write: (expGolomb, input, options, index, value) => {
      }
    }
  }
};

export default dataTypes;
