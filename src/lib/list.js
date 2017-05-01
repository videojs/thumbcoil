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
