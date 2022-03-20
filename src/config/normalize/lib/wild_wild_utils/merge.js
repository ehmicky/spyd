import { map } from './map.js'

// eslint-disable-next-line max-params
const pushUnshift = function (mapFunc, target, query, newValue, opts = {}) {
  return map(target, query, mapFunc.bind(undefined, newValue), {
    ...opts,
    entries: false,
  })
}

const pushValue = function (newValue, value) {
  return Array.isArray(value) ? [...value, ...newValue] : newValue
}

// Like `set()` but push an array of values to the target array instead
export const push = pushUnshift.bind(undefined, pushValue)

const unshiftValue = function (newValue, value) {
  return Array.isArray(value) ? [...newValue, ...value] : newValue
}

// Like `push()` but from the beginning
export const unshift = pushUnshift.bind(undefined, unshiftValue)
