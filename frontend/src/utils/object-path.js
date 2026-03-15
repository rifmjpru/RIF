export const getByPath = (object, path) =>
  path.reduce((current, key) => current?.[key], object);

export const setByPath = (object, path, value) => {
  const clone = structuredClone(object);
  let cursor = clone;

  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index]];
  }

  cursor[path[path.length - 1]] = value;
  return clone;
};

