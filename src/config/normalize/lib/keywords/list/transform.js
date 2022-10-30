import isPlainObj from 'is-plain-obj'
import { normalizePath } from 'wild-wild-parser'

const normalize = function (definition) {
  if (!isTransformMove(definition)) {
    return { value: definition }
  }

  const { value, newProp } = definition

  try {
    return { value, newProp: normalizePath(newProp) }
  } catch (cause) {
    throw new Error(`must return a valid "newProp":\n${cause.message}`)
  }
}

// `transform()` can return a `{ newProp, value }` object to indicate the
// property name has been moved.
//  - It does not move the property.
//  - Instead, it indicates it's been moved so error messages show the name
//    of the property before being moved
const isTransformMove = function (definition) {
  return (
    isPlainObj(definition) && 'value' in definition && 'newProp' in definition
  )
}

const main = function (definition, input) {
  const { value } = definition
  const { newProp = findCommonMove(value, input) } = definition
  return { input: value, path: newProp }
}

// Automatically detect some common type of moves
const findCommonMove = function (newInput, oldInput) {
  const commonMove = COMMON_MOVES.find(({ test }) => test(newInput, oldInput))
  return commonMove === undefined ? undefined : commonMove.getNewProp(newInput)
}

const COMMON_MOVES = [
  // When normalizing `input` to `[input]` with a single element
  {
    test(newInput, oldInput) {
      return (
        Array.isArray(newInput) &&
        newInput.length === 1 &&
        newInput[0] === oldInput
      )
    },
    getNewProp() {
      return [0]
    },
  },
  // When normalizing `input` to `{ [propName]: input }` with a single property
  {
    test(newInput, oldInput) {
      return (
        isPlainObj(newInput) &&
        Object.keys(newInput).length === 1 &&
        newInput[Object.keys(newInput)[0]] === oldInput
      )
    },
    getNewProp(newInput) {
      return [Object.keys(newInput)[0]]
    },
  },
]

// Apply `transform(input, info)` which transforms the input.
// If can also delete it by returning `undefined`.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'transform',
  hasInput: true,
  undefinedDefinition: true,
  exampleDefinition: 'newValue',
  normalize,
  main,
}
