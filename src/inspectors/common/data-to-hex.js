const dataToHex = function (value, indent) {
  let bytesAsArray = Array.prototype.slice.call(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
  // print out raw bytes as hexademical
  let ascii = bytesAsArray
      .reduce(groupBy(16), [])
      .map(line => {
        return line
          .map(byte => byte <= 31 || (byte >= 127 && byte <= 159) ? '.' : String.fromCharCode(byte))
          .map(char => char === '&' ? '&amp;' : char === '<' ? '&lt;' : char)
      })
      .map(a => a.join(''))
/*      .join('')
      .match(/.{1,48}/g);*/

  var bytes = bytesAsArray
      .map(byte => ('00' + byte.toString(16)).slice(-2))
      .reduce(groupBy(8), []) // form arrays of 8-bytes each
      .reduce(groupBy(2), []) // create arrays of pairs of 8-byte arrays
      .map(a => a.map(a => a.join(' ')).join('  ')) // Stringify
/*      .join('')
      .match(/.{1,48}/g);*/

  if (!bytes) {
    return '<>';
  }

  if (bytes.length === 1) {
    return bytes.join('').slice(1);
  }

  return bytes.map(function (line, index) {
    let hexSide = indent + line;

    // Pad so that the remaining line length is 70 (= 48 + 6 + 16) for hex, pad, ascii
    while (hexSide.length < 54) hexSide += ' ';

    return hexSide + ascii[index];
  }).join('\n');
}

const groupBy = (count) => (p, c) => {
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

export default dataToHex;
