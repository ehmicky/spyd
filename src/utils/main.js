// Like lodash _.omitBy()
export const omitBy = function(object, condition) {
  const pairs = Object.entries(object)
    .filter(([key, value]) => !condition(key, value))
    .map(([key, value]) => ({ [key]: value }))
  return Object.assign({}, ...pairs)
}

export const isPlainObject = function(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.constructor === Object || value.constructor === undefined)
  )
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
