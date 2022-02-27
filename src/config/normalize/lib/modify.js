import { callValueFunc, callUserFunc, getValidateExampleError } from './call.js'
import { resolvePath } from './path.js'
import { has } from './star_dot_path/main.js'
import { transformValue } from './transform.js'
import { getWarnings } from './warn.js'

// Once the initial value has been computed, apply validation and transforms,
// unless the value is `undefined`.
export const validateAndModify = async function ({
  value,
  path,
  glob,
  required,
  validate,
  warn,
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
  const warnings = await getWarnings(valueA, warn, opts)
  const { value: valueB, newName } = await transformValue(
    valueA,
    transform,
    opts,
  )
  const name = await renameProp(valueB, rename, opts)
  const newNames = [newName, name].filter(Boolean)
  return { value: valueB, name, newNames, warnings }
}

// Apply `required(opts)` which throws if `true` and value is `undefined`
const validateRequired = async function (required, value, opts) {
  if (await callUserFunc(required, opts)) {
    throw await getValidateExampleError('must be defined.', value, opts)
  }
}

// Apply `validate(value, opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (validate === undefined) {
    return
  }

  await Promise.all(
    validate.map((validateFunc) => callValueFunc(validateFunc, value, opts)),
  )
}

// Apply `rename(value, opts)` which transforms the property's name.
// This can be used for aliasing and deprecation.
//  - Therefore, this is only applied if the destination value is `undefined`.
//    Like this, if both an old alias and a new one are specified, the new one
//    has priority.
const renameProp = async function (value, rename, opts) {
  if (rename === undefined) {
    return
  }

  const name = String(await callValueFunc(rename, value, opts))
  return has(opts.funcOpts.config, name) ? undefined : name
}
