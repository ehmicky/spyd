// Use the token to list entries against a target value.
export const iterateToken = function (value, token, tokenTypeName) {
  return ITERATORS[tokenTypeName](value, token)
}

// By using `for in`, we purposely exclude both symbols and inherited properties
const iterateAny = function (value) {
  return Array.isArray(value)
    ? value.map((childValue, index) => ({
        value: childValue,
        prop: index,
        missing: false,
      }))
    : Object.keys(value).map((childKey) => ({
        value: value[childKey],
        prop: childKey,
        missing: false,
      }))
}

const iterateRegexp = function (value, token) {
  return Object.keys(value)
    .filter((childKey) => token.test(childKey))
    .map((childKey) => ({
      value: value[childKey],
      prop: childKey,
      missing: false,
    }))
}

// Use the token to list entries against a target value.
const iterateSlice = function (value, { from, to }) {
  const fromIndex = getBoundedIndex(value, from)
  const toIndex = Math.max(getBoundedIndex(value, to), fromIndex)
  return new Array(toIndex - fromIndex).fill().map((_, index) => ({
    value: value[index + fromIndex],
    prop: index + fromIndex,
    missing: false,
  }))
}

// Unlike the array token, indices are max-bounded to the end of the array:
//  - This prevents maliciously creating big arrays to crash the process
//  - Appending values is less useful in the context of a slice
const getBoundedIndex = function (value, edge) {
  const index = getArrayIndex(value, edge)
  return Math.min(index, value.length)
}

const iterateArray = function (value, token) {
  const index = getArrayIndex(value, token)
  return [{ value: value[index], prop: index, missing: index >= value.length }]
}

// Negative array indices start from the end.
// Indices that are out-of-bound:
//  - Do not error
//  - Are min-bounded to 0
//  - Are not max-bounded:
//     - Those return a missing entry instead
//     - Reasons:
//        - This is more consistent with how missing entries with property names
//          are handled
//        - This allows appending with -0
//        - This is better when setting values on arrays with varying sizes
const getArrayIndex = function (value, token) {
  return token > 0 || Object.is(token, +0)
    ? token
    : Math.max(value.length + token, 0)
}

// We distinguish between:
//  - Missing property name: return no entries
//  - Property exists but has `undefined` value: return an entry
const iterateProp = function (value, token) {
  return [{ value: value[token], prop: token, missing: !(token in value) }]
}

const ITERATORS = {
  any: iterateAny,
  regexp: iterateRegexp,
  array: iterateArray,
  slice: iterateSlice,
  prop: iterateProp,
}
