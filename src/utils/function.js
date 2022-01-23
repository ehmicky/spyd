// A value to be either a function or directly a return value
export const maybeFunction = function (value, ...args) {
  return typeof value === 'function' ? value(...args) : value
}
