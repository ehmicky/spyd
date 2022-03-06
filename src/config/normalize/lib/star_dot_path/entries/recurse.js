import isPlainObj from 'is-plain-obj'

// Whether a property is considered an object that can:
//  - Be recursed over
// This must return `false` for arrays.
export const isObject = function (value) {
  return isPlainObj(value)
}
