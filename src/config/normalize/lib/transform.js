import isPlainObj from 'is-plain-obj'
import pReduce from 'p-reduce'
import { normalizePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callValueFunc, callNoValueFunc } from './call.js'

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
export const transformValue = async function (value, transform, opts) {
  if (transform === undefined) {
    return { value }
  }

  const { value: valueA, newProps } = await pReduce(
    transform,
    (memo, transformFunc) => transformSingleValue(memo, transformFunc, opts),
    { value, newProps: [] },
  )
  const newPath = getNewPath(newProps, opts)
  return { value: valueA, newPath }
}

const transformSingleValue = async function (
  { value, newProps },
  transformFunc,
  opts,
) {
  const { value: valueA, newProp } = await getTransformedValue(
    value,
    transformFunc,
    opts,
  )
  const newPropsA = newProp === undefined ? newProps : [...newProp, ...newProps]
  return { value: valueA, newProps: newPropsA }
}

const getTransformedValue = async function (value, transformFunc, opts) {
  const transformReturn = await callValueFunc(transformFunc, value, opts)
  return isTransformMove(transformReturn)
    ? callNoValueFunc(getTransformMove.bind(undefined, transformReturn), opts)
    : {
        value: transformReturn,
        newProp: findCommonMove(transformReturn, value),
      }
}

// `transform()` can return a `{ newProp, value }` object to indicate the
// property name has been moved.
//  - It does not move the property.
//  - Instead, it indicates it's been moved so error messages show the name
//    of the property before being moved
const isTransformMove = function (transformReturn) {
  return (
    isPlainObj(transformReturn) &&
    'value' in transformReturn &&
    'newProp' in transformReturn
  )
}

const getTransformMove = function ({ value, newProp }) {
  try {
    const newPropA = normalizePath(newProp)
    return newPropA.length === 0 ? {} : { value, newProp: newPropA }
  } catch (error) {
    throw wrapError(error, 'The returned "newProp" is invalid:')
  }
}

// Automatically detect some common type of moves
const findCommonMove = function (newValue, oldValue) {
  const commonMove = COMMON_MOVES.find(({ test }) => test(newValue, oldValue))
  return commonMove === undefined ? undefined : commonMove.getNewProp(newValue)
}

const COMMON_MOVES = [
  // When normalizing `value` to `[value]` with a single element
  {
    test(newValue, oldValue) {
      return (
        Array.isArray(newValue) &&
        newValue.length === 1 &&
        newValue[0] === oldValue
      )
    },
    getNewProp() {
      return [0]
    },
  },
  // When normalizing `value` to `{ [propName]: value }` with a single property
  {
    test(newValue, oldValue) {
      return (
        isPlainObj(newValue) &&
        Object.keys(newValue).length === 1 &&
        newValue[Object.keys(newValue)[0]] === oldValue
      )
    },
    getNewProp(newValue) {
      return [Object.keys(newValue)[0]]
    },
  },
]

const getNewPath = function (newProps, { funcOpts: { path } }) {
  return newProps.length === 0 ? undefined : [...path, ...newProps]
}
