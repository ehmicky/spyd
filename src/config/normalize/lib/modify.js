import { callValueFunc, callUserFunc, getValidateExampleError } from './call.js'
import { resolvePath } from './path.js'
import { transformValue } from './transform.js'
import { getWarnings } from './warn.js'
import { parsePath } from './wild_wild_parser/main.js'
import { has } from './wild_wild_path/main.js'

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
  const { value: valueB, newPath } = await transformValue(
    valueA,
    transform,
    opts,
  )
  const renamedPath = await renameProp(valueB, rename, opts)
  const newPaths = [newPath, renamedPath].filter(Boolean)
  return { value: valueB, renamedPath, newPaths, warnings }
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

  const renameReturn = await callValueFunc(rename, value, opts)

  if (renameReturn === undefined) {
    return
  }

  const renamedPath = parsePath(renameReturn)
  return has(opts.funcOpts.config, renamedPath) ? undefined : renamedPath
}
