import { callValueFunc, callUserFunc, getValidateExampleError } from './call.js'
import { resolvePath } from './path.js'
import { transformValue } from './transform.js'

// Once the initial value has been computed, apply validation and transforms,
// unless the value is `undefined`.
export const validateAndModify = async function ({
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
  const { value: valueB, newProp } = await transformValue(
    valueA,
    transform,
    opts,
  )
  const name = await renameProp(valueB, rename, opts)
  const newProps = [newProp, name].filter(Boolean)
  return { value: valueB, name, newProps }
}

// Apply `required(opts)` which throws if `true` and value is `undefined`
const validateRequired = async function (required, value, opts) {
  if (await callUserFunc(required, opts)) {
    throw await getValidateExampleError('must be defined.', value, opts)
  }
}

// Apply `validate(value, opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (validate !== undefined) {
    await callValueFunc(validate, value, opts)
  }
}

// Apply `rename(value, opts)` which transforms the property's name.
// This can be used for aliasing and deprecation.
const renameProp = async function (value, rename, opts) {
  return rename === undefined
    ? undefined
    : String(await callValueFunc(rename, value, opts))
}
