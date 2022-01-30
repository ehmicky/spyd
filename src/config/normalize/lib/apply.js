import {
  callValueFunc,
  callUserFunc,
  callValidateFunc,
  throwValidateError,
} from './call.js'
import { resolvePath } from './path.js'

// Once the initial value has been computed, apply validation and transforms,
// unless the value is `undefined`.
export const applyValidateTransform = async function ({
  value,
  path,
  cwd,
  glob,
  required,
  validate,
  transform,
  opts,
}) {
  if (value === undefined) {
    await validateRequired(required, opts)
    return value
  }

  const valueA = await resolvePath(value, { path, cwd, glob, opts })
  await validateValue(valueA, validate, opts)
  const valueB = await transformValue(valueA, transform, opts)
  return valueB
}

// Apply `required(opts)` which throws if `true` and value is `undefined`
const validateRequired = async function (required, opts) {
  if (await callUserFunc(required, opts)) {
    throwValidateError('must be defined.', opts)
  }
}

// Apply `validate(value, opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (validate !== undefined) {
    await callValidateFunc(validate, value, opts)
  }
}

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
const transformValue = async function (value, transform, opts) {
  return transform === undefined
    ? value
    : await callValueFunc(transform, value, opts)
}
