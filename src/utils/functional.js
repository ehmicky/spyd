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

// Combine multiple normalizing functions into a single one.
export const composeNormalizers = function (...normalizers) {
  return compose(...normalizers.map(bindNormalizer))
}

const bindNormalizer = function (normalizer) {
  return runNormalizer.bind(undefined, normalizer)
}

// A normalizing function transforms a value by returning.
// It can return `undefined` to leave the value as is.
export const runNormalizer = function (normalizer, value, ...args) {
  const newValue = normalizer(value, ...args)
  return newValue === undefined ? value : newValue
}

// Combine multiple functions into a single one which reduces a value
// iteratively
const compose = function (...callFuncs) {
  return runCompose.bind(undefined, callFuncs)
}

const runCompose = function (callFuncs, value, ...args) {
  return callFuncs.reduce(
    (valueA, callFunc) => callFunc(valueA, ...args),
    value,
  )
}
