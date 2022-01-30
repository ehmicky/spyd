import { callValueFunc, callUserFunc } from './call.js'

export const applyDefinition = async function (
  { condition, default: defaultValue, compute, validate, transform },
  value,
  opts,
) {
  if (await againstCondition(value, condition, opts)) {
    return value
  }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  const valueB = await computeValue(valueA, compute, opts)
  await validateValue(valueB, validate, opts)
  const valueC = await transformValue(valueB, transform, opts)
  return valueC
}

// Apply `condition(opts)` which skips the current definition if `false` is
// returned.
const againstCondition = async function (value, condition, opts) {
  return (
    condition !== undefined && !(await callValueFunc(condition, value, opts))
  )
}

// Apply `default(opts)` which assigns a default value
const addDefaultValue = async function (value, defaultValue, opts) {
  return value === undefined ? await callUserFunc(defaultValue, opts) : value
}

// Apply `compute(opts)` which sets a value from the system, instead of the user
const computeValue = async function (value, compute, opts) {
  return compute === undefined ? value : await callUserFunc(compute, opts)
}

// Apply `validate(opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (value === undefined || validate === undefined) {
    return
  }

  await callValueFunc(validate, value, opts)
}

// Apply `transform(value)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
const transformValue = async function (value, transform, opts) {
  return value === undefined || transform === undefined
    ? value
    : await callValueFunc(transform, value, opts)
}
