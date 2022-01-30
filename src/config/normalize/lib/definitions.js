// eslint-disable-next-line no-restricted-imports, node/no-restricted-import
import { AssertionError } from 'assert'

import { callValueFunc, callUserFunc } from './call.js'

export const applyDefinition = async function (
  { pick, condition, default: defaultValue, compute, validate, transform },
  value,
  opts,
) {
  if (await againstPick(value, pick, opts)) {
    return
  }

  if (await againstCondition(value, condition, opts)) {
    return value
  }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  const valueB = await computeValue(valueA, compute, opts)
  await validateValue(valueB, validate, opts)
  const valueC = await transformValue(valueB, transform, opts)
  return valueC
}

// Apply `pick(value, opts)` which omits the current value if `false` is
// returned. It also skips the current definition.
// For example, this is useful when several commands share some properties but
// not all.
const againstPick = async function (value, pick, opts) {
  return pick !== undefined && !(await callValueFunc(pick, value, opts))
}

// Apply `condition(value, opts)` which skips the current definition if `false`
// is returned.
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

  try {
    await callValueFunc(validate, value, opts)
  } catch (error) {
    handleValidateError(error)
    throw error
  }
}

// Consumers can distinguish users errors from system bugs by checking
// the `error.validation` boolean property.
// User errors require both:
//  - Using `validate()`, not other definition methods
//  - Throwing an `AssertionError`, e.g. with `assert()`
// We fail on the first error, as opposed to aggregating all errors
//  - Otherwise, a failed property might be used by another property, which
//    would also appear as failed, even if it has no issues
const handleValidateError = function (error) {
  if (error instanceof AssertionError) {
    error.validation = true
  }
}

// Apply `transform(value)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
const transformValue = async function (value, transform, opts) {
  return value === undefined || transform === undefined
    ? value
    : await callValueFunc(transform, value, opts)
}