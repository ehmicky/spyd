import { callValueFunc } from './call.js'
import { resolvePath } from './path.js'
import { throwValidateError } from './validate.js'

// Once the initial value has been computed, apply validation and transforms,
// unless the value is `undefined`.
export const applyValidateTransform = async function ({
  value,
  path,
  glob,
  required,
  validate,
  transform,
  rename,
  opts,
}) {
  if (value === undefined) {
    await validateRequired(required, value, opts)
    return { value }
  }

  const valueA = await resolvePath({ value, path, glob, opts })
  await validateValue(valueA, validate, opts)
  const valueB = await transformValue(valueA, transform, opts)
  const name = await renameProp(valueB, rename, opts)
  return { value: valueB, name }
}

// Apply `required(value, opts)` which throws if `true` and value is `undefined`
const validateRequired = async function (required, value, opts) {
  if (await callValueFunc(required, value, opts)) {
    await throwValidateError('must be defined.', opts)
  }
}

// Apply `validate(value, opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (validate !== undefined) {
    await callValueFunc(validate, value, opts)
  }
}

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
const transformValue = async function (value, transform, opts) {
  return transform === undefined
    ? value
    : await callValueFunc(transform, value, opts)
}

// Apply `rename(value, opts)` which transforms the property's name.
// This can be used for aliasing and deprecation.
const renameProp = async function (value, rename, opts) {
  return rename === undefined
    ? undefined
    : String(await callValueFunc(rename, value, opts))
}
