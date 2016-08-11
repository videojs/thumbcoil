const dataToHex = function (value, indent) {
  // print out raw bytes as hexademical
  var bytes = Array.prototype.slice.call(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))
      .map(byte => ('00' + byte.toString(16)).slice(-2))
      .reduce(groupBy(8), [])
      .map(a => a.join(' '))
      .reduce(groupBy(2), [])
      .map(a => a.join('  '))
      .join('')
      .match(/.{1,48}/g);

  if (!bytes) {
    return '<>';
  }

  if (bytes.length === 1) {
    return bytes.join('').slice(1);
  }

  return bytes.map(function (line) {
    return indent + line;
  }).join('\n');
}

const groupBy = function (count) {
  return (p, c) => {
    let last = p.pop();

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

export default dataToHex;
