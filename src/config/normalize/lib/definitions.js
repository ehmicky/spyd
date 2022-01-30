import { callValueFunc, callUserFunc, callValidateFunc } from './call.js'
import { resolvePath } from './path.js'

export const applyDefinition = async function (
  {
    pick,
    condition,
    default: defaultValue,
    compute,
    path = false,
    cwd = '.',
    glob = false,
    validate,
    transform,
  },
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
  const valueC = await resolvePath(valueB, { path, cwd, glob, opts })
  await validateValue(valueC, validate, opts)
  const valueD = await transformValue(valueC, transform, opts)
  return valueD
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

// Apply `validate(value, opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (value !== undefined && validate !== undefined) {
    await callValidateFunc(validate, value, opts)
  }
}

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
const transformValue = async function (value, transform, opts) {
  return value !== undefined && transform !== undefined
    ? await callValueFunc(transform, value, opts)
    : value
}
