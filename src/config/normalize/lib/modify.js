import isPlainObj from 'is-plain-obj'

import { callValueFunc, callUserFunc, getValidateExampleError } from './call.js'
import { resolvePath } from './path.js'

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
  const { value: valueB, newPath } = await transformValue(
    valueA,
    transform,
    opts,
  )
  const name = await renameProp(valueB, rename, opts)
  const newPaths = [newPath, name].filter(Boolean)
  return { value: valueB, name, newPaths }
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

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
const transformValue = async function (value, transform, opts) {
  if (transform === undefined) {
    return { value }
  }

  const transformReturn = await callValueFunc(transform, value, opts)

  if (isTransformMove(transformReturn)) {
    return getTransformMove(transformReturn, opts)
  }

  const commonMove = COMMON_MOVES.find(({ test }) =>
    test(transformReturn, value),
  )

  if (commonMove === undefined) {
    return { value: transformReturn }
  }

  const newPath = commonMove.getNewPath(transformReturn)
  const newPathA = `${opts.funcOpts.name}.${newPath}`
  return { value: transformReturn, newPath: newPathA }
}

// `transform()` can return a `{ newPath, value }` object to indicate the
// property name has been moved
const isTransformMove = function (transformReturn) {
  return (
    isPlainObj(transformReturn) &&
    typeof transformReturn.newPath === 'string' &&
    transformReturn.newPath !== '' &&
    'value' in transformReturn
  )
}

const getTransformMove = function ({ newPath, value }, { funcOpts: { name } }) {
  return { newPath: `${name}.${newPath}`, value }
}

const COMMON_MOVES = [
  {
    test(newValue, oldValue) {
      return (
        Array.isArray(newValue) &&
        newValue.length === 1 &&
        newValue[0] === oldValue
      )
    },
    getNewPath() {
      return '0'
    },
  },
  {
    test(newValue, oldValue) {
      return (
        isPlainObj(newValue) &&
        Object.keys(newValue).length === 1 &&
        newValue[Object.keys(newValue)[0]] === oldValue
      )
    },
    getNewPath(newValue) {
      return Object.keys(newValue)[0]
    },
  },
]

// Apply `rename(value, opts)` which transforms the property's name.
// This can be used for aliasing and deprecation.
const renameProp = async function (value, rename, opts) {
  return rename === undefined
    ? undefined
    : String(await callValueFunc(rename, value, opts))
}
