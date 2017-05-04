export const getProperty = function (obj, options, property, indexes) {
  const firstProperty = obj[property] || options[property];

  if (!indexes.length) {
    return firstProperty;
  }

  return indexes.reduce((finalProperty, index) => {
    if (Array.isArray(finalProperty) || Object.isObject(finalProperty)) {
      return finalProperty[index];
    }
    return finalProperty;
  }, firstProperty);
};

export const writeProperty = function (obj, options, property, indexes, value) {
  let firstProperty = obj[property] || options[property];
  let lastIndex = indexes[indexes.length - 1];

  if (!firstProperty) {
    if (indexes.length) {
      firstProperty = obj[property] = [];
    } else {
      obj[property] = value;
      return;
    }
  }

  let target = indexes.slice(0, -1).reduce((finalProperty, index) => {
    let newProperty = finalProperty[index];

    if (!Array.isArray(finalProperty[index])) {
      finalProperty[index] = [];
    }

    return finalProperty[index];
  }, firstProperty);

  target[lastIndex] = value;
};

export const indexArrayMerge = function (indexesArray, propertyArray) {
  let newArray = indexesArray.slice(-propertyArray.length);

  return newArray.map((num, index) => {
    if (isNaN(propertyArray[index])) {
      return num;
    } else {
      return propertyArray[index];
    }
  });
};
