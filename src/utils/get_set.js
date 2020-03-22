// Retrieve a deep property using an array of keys
export const get = function (obj, keys) {
  return keys.reduce(getReduce, obj)
}

const getReduce = function (obj, key) {
  return obj[key]
}

// Set a deep property using an array of keys
export const set = function (obj, keys, val) {
  if (keys.length === 0) {
    return val
  }

  const [childKey, ...keysA] = keys
  const child = obj[childKey] || {}
  const childA = set(child, keysA, val)

  return { ...obj, [childKey]: childA }
}
