export const isEmptyObject = function (object) {
  return Object.values(object).every(isUndefined)
}

const isUndefined = function (value) {
  return value === undefined
}

// ES specifications mostly use promiseLike objects not promises
export const isPromiseLike = function (value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof value.then === 'function'
  )
}
