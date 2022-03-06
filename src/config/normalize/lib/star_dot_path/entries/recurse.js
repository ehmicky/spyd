import isPlainObj from 'is-plain-obj'

// Whether a property is considered an object that can:
//  - Be recursed over
//  - Be cloned with `{...}`
//     - Therefore we do not allow class instances
// This must return `false` for arrays.
export const isObject = function (value) {
  return isPlainObj(value)
}
