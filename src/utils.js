// Like lodash _.omitBy()
export const omitBy = function(object, condition) {
  const pairs = Object.entries(object)
    .filter(([key, value]) => !condition(key, value))
    .map(([key, value]) => ({ [key]: value }))
  return Object.assign({}, ...pairs)
}

export const isPromiseLike = function(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof value.then === 'function'
  )
}

export const sortNumbers = function(array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function(numA, numB) {
  return numA - numB
}
