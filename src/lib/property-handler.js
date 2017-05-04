export const propertyHandler = function (property) {
  let propertySplit = property.split('[');
  let propertyName = propertySplit[0];
  let indexArray = null;

  if (propertySplit.length > 1) {
    indexArray = propertySplit.slice(1).map(parseFloat);
  }

  return {
    propertyName,
    indexArray
  };
};
