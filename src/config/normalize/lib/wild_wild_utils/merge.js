import { map } from './map.js'

// eslint-disable-next-line max-params
const pushUnshift = function (mapFunc, target, query, newValues, opts = {}) {
  return map(target, query, (value) => mapFunc(value, newValues, opts), {
    ...opts,
    entries: false,
  })
}

const pushValue = function (value, newValues, { mutate }) {
  if (!Array.isArray(value)) {
    return newValues
  }

  if (!mutate) {
    return [...value, ...newValues]
  }

  newValues.forEach((newValue) => {
    // eslint-disable-next-line fp/no-mutating-methods
    value.push(newValue)
  })
  return value
}

// Like `set()` but push an array of values to the target array instead
export const push = pushUnshift.bind(undefined, pushValue)

const unshiftValue = function (value, newValues, { mutate }) {
  if (!Array.isArray(value)) {
    return newValues
  }

  if (!mutate) {
    return [...newValues, ...value]
  }

  newValues.forEach((newValue) => {
    // eslint-disable-next-line fp/no-mutating-methods
    value.unshift(newValue)
  })
  return value
}

// Like `push()` but from the beginning
export const unshift = pushUnshift.bind(undefined, unshiftValue)
