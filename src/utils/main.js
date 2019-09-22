// Like lodash _.omit()
export const omit = function(object, keys) {
  return keys.reduce(omitReduce, object)
}

const omitReduce = function(object, key) {
  // eslint-disable-next-line no-unused-vars
  const { [key]: value, ...objectA } = object
  return objectA
}

export const isEmptyObject = function(object) {
  return Object.values(object).every(isUndefined)
}

const isUndefined = function(value) {
  return value === undefined
}

// ES specifications mostly use promiseLike objects not promises
export const isPromiseLike = function(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof value.then === 'function'
  )
}
