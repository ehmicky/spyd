import { map } from './map.js'

// Like `set()` but push an array of values to the target array instead
// eslint-disable-next-line max-params
export const push = function (target, query, newValue, opts = {}) {
  const mapFunc = pushValue.bind(undefined, newValue)
  return map(target, query, mapFunc, { ...opts, entries: false })
}

const pushValue = function (newValue, value) {
  return Array.isArray(value) ? [...value, ...newValue] : newValue
}

// Like `push()` but from the beginning
// eslint-disable-next-line max-params
export const unshift = function (target, query, newValue, opts = {}) {
  const mapFunc = unshiftValue.bind(undefined, newValue)
  return map(target, query, mapFunc, { ...opts, entries: false })
}

const unshiftValue = function (newValue, value) {
  return Array.isArray(value) ? [...newValue, ...value] : newValue
}
