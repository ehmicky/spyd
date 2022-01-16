// Apply `callFunc(...)` but only if `conditionFunc(...)` returns `true`.
// Otherwise, returns the first argument as is.
export const condition = function (callFunc, conditionFunc) {
  return conditionCall.bind(undefined, callFunc, conditionFunc)
}

const conditionCall = function (callFunc, conditionFunc, ...args) {
  return conditionFunc(...args) ? callFunc(...args) : args[0]
}

// Allow to use `callFunc(...)` instead of `callFunc.bind(undefined, ...)` when
// a function is always meant to be bound.
export const curry = function (callFunc) {
  return bindArgs.bind(undefined, callFunc)
}

const bindArgs = function (callFunc, ...boundArgs) {
  return callFunc.bind(undefined, ...boundArgs)
}
