import isPlainObj from 'is-plain-obj'

// Whether a property is considered an object that be recursed over
export const isObject = function (value) {
  return isPlainObj(value)
}
