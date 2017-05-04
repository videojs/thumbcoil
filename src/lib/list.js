export const list = function (parseFns, silent) {
  return {
    decode: ({expGolomb, output, options, indexes, path}) => {
      const newPath = silent ? path : path.concat('[list]');

      parseFns.forEach((fn) => {
        output = fn.decode({
          expGolomb,
          output,
          options,
          indexes,
          path: newPath
        }) || output;
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
