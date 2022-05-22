import { normalizePath } from 'wild-wild-parser'
import { has } from 'wild-wild-path'

import { callValueFunc, callUndefinedValueFunc } from './call.js'
import { resolveGlob } from './glob.js'
import { resolvePath } from './path.js'
import { validateSchema } from './schema.js'
import { transformValue } from './transform.js'
import { getWarnings } from './warn.js'

// Once the initial value has been computed, apply validation and transforms,
// unless the value is `undefined`.
// eslint-disable-next-line max-statements
export const validateAndModify = async function ({
  value,
  required,
  schema,
  path,
  glob,
  validate,
  warn,
  transform,
  rename,
  opts,
}) {
  if (value === undefined) {
    await validateRequired(required, opts)
    return { value }
  }

  await validateSchema(value, schema, opts)
  const valueA = await resolveGlob(value, glob, opts)
  const valueB = await resolvePath(valueA, path, opts)
  await validateValue(valueB, validate, opts)
  const warnings = await getWarnings(valueB, warn, opts)
  const { value: valueC, newPath } = await transformValue(
    valueB,
    transform,
    opts,
  )
  const renamedPath = await renameProp(valueC, rename, opts)
  const newPaths = [newPath, renamedPath].filter(Boolean)
  return { value: valueC, renamedPath, newPaths, warnings }
}

// Apply `required[(opts)]` which throws if `true` and value is `undefined`
const validateRequired = async function (required, opts) {
  if (await callUndefinedValueFunc(required, opts)) {
    await callUndefinedValueFunc(throwRequired, opts)
  }
}

const throwRequired = function () {
  throw new Error('must be defined.')
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

// Apply `rename[(value, opts)]` which transforms the property's name.
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

  const renamedPath = normalizePath(renameReturn)
  return has(opts.funcOpts.config, renamedPath) ? undefined : renamedPath
}
