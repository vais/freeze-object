module.exports = function freezeObject(object, frozenSet = new WeakSet()) {
  if (object === null) {
    return object;
  }

  switch (typeof object) {
    case 'object':
    case 'function':
      break;
    default:
      return object;
  }

  if (frozenSet.has(object)) {
    return object;
  }

  frozenSet.add(Object.freeze(object));

  Reflect.ownKeys(object).forEach((key) =>
    freezeObject(object[key], frozenSet),
  );

  return object;
};
