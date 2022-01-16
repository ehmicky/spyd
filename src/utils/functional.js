// Apply `callFunc(...)` but only if `conditionFunc(...)` returns `true`.
// Otherwise, returns the first argument as is.
export const condition = function (callFunc, conditionFunc) {
  return conditionCall.bind(undefined, callFunc, conditionFunc)
}

const conditionCall = function (callFunc, conditionFunc, ...args) {
  return conditionFunc(...args) ? callFunc(...args) : args[0]
}
