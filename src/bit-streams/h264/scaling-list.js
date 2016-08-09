'use strict';

const scalingList = {
  decode: function (expGolomb, output, options, index) {
    let lastScale = 8;
    let nextScale = 8;
    let deltaScale;
    let count = 16;
    let scalingArr = [];

    if (!Array.isArray(output.scalingList)) {
      output.scalingList = [];
    }

    if (index >= 6) {
      count = 64;
    }

    for (let j = 0; j < count; j++) {
      if (nextScale !== 0) {
        deltaScale = expGolomb.readExpGolomb();
        nextScale = (lastScale + deltaScale + 256) % 256;
      }

      scalingArr[j] = (nextScale === 0) ? lastScale : nextScale;
      lastScale = scalingArr[j];
    }

    output.scalingList[index] = scalingArr;

    return output;
  },
  encode: function (expGolomb, input, options, index) {
    let lastScale = 8;
    let nextScale = 8;
    let deltaScale;
    let count = 16;
    let output = '';

    if (!Array.isArray(input.scalingList)) {
      return '';
    }

    if (index >= 6) {
      count = 64;
    }

    let scalingArr = output.scalingList[index];

    for (let j = 0; j < count; j++) {
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

export default scalingList;
