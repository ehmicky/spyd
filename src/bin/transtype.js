import isPlainObj from 'is-plain-obj'

import { recurseValues } from '../utils/recurse.js'

// Transtype CLI flags after parsing
export const transtypeCliFlags = function (configFlags) {
  return recurseValues(configFlags, transtypeCliFlag)
}

const transtypeCliFlag = function (value) {
  const valueA = transtypeArray(value)
  const valueB = transtypeBoolean(valueA)
  return valueB
}

// Allow setting arrays using dot notation.
// For example `--one.0.two=true` becomes `{ one: [{ two: true }] }`
const transtypeArray = function (value) {
  if (!isPlainObj(value)) {
    return value
  }

  const keys = Object.keys(value)

  if (keys.length === 0 || !keys.every(isArrayIndex)) {
    return value
  }

  return objectToArray(value, keys)
}

const objectToArray = function (object, keys) {
  const maxIndex = Math.max(...keys.map(Number))
  const array = new Array(maxIndex).fill()

  // eslint-disable-next-line fp/no-loops
  for (const key of keys) {
    // eslint-disable-next-line fp/no-mutation
    array[Number(key)] = object[key]
  }

  return array
}

const isArrayIndex = function (key) {
  const index = Number(key)
  return Number.isInteger(index) && index >= 0
}

// Yargs interprets `--flag` and `--no-flag` with no arguments as booleans.
// Additionally, it interprets `--flag=true|false` as booleans instead of
// as strings when specifying the `boolean: true` option.
// However, we minimize Yargs parsing and validation since it is imperfect and
// does not well with:
//  - Object with dynamic property names
//  - Polymorphic types, such as "either boolean or array of booleans"
// Therefore, we perform this transformation manually.
const transtypeBoolean = function (value) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}
