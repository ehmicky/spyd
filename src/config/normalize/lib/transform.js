import isPlainObj from 'is-plain-obj'

import { callValueFunc } from './call.js'

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
export const transformValue = async function (value, transform, opts) {
  if (transform === undefined) {
    return { value }
  }

  const transformReturn = await callValueFunc(transform, value, opts)

  const { name } = opts.funcOpts

  if (isTransformMove(transformReturn)) {
    return getTransformMove(transformReturn, name)
  }

  const commonMoveReturn = applyCommonMoves(transformReturn, value, name)
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

const getTransformMove = function ({ newPath, value }, name) {
  return { newPath: `${name}.${newPath}`, value }
}

// Automatically detect some common type of moves
const applyCommonMoves = function (newValue, oldValue, name) {
  const commonMove = COMMON_MOVES.find(({ test }) => test(newValue, oldValue))

  if (commonMove === undefined) {
    return
  }

  const newPath = commonMove.getNewPath(newValue)
  const newPathA = `${name}.${newPath}`
  return { value: newValue, newPath: newPathA }
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
    getNewPath() {
      return '0'
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
    getNewPath(newValue) {
      return Object.keys(newValue)[0]
    },
  },
]
