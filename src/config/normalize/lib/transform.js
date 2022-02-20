import isPlainObj from 'is-plain-obj'

import { callValueFunc } from './call.js'

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
export const transformValue = async function (value, transform, opts) {
  if (transform === undefined) {
    return { value }
  }

  const transformReturn = await callValueFunc(transform, value, opts)

  if (isTransformMove(transformReturn)) {
    return getTransformMove(transformReturn, opts)
  }

  const commonMoveReturn = applyCommonMoves(transformReturn, value, opts)
  return commonMoveReturn === undefined
    ? { value: transformReturn }
    : commonMoveReturn
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

const applyCommonMoves = function (transformReturn, value, opts) {
  const commonMove = COMMON_MOVES.find(({ test }) =>
    test(transformReturn, value),
  )

  if (commonMove === undefined) {
    return
  }

  const newPath = commonMove.getNewPath(transformReturn)
  const newPathA = `${opts.funcOpts.name}.${newPath}`
  return { value: transformReturn, newPath: newPathA }
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
