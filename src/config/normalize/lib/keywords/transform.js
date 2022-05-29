export const name = 'transform'
export const hasInput = true
export const undefinedDefinition = true

// Apply `transform(input, opts)` which transforms the input.
// If can also delete it by returning `undefined`.
export const main = function (definition, input) {
  const { value, newProp } = isTransformMove(definition)
    ? definition
    : {
        value: definition,
        newProp: findCommonMove(definition, input),
      }
  return { input: value, path: newProp }
}

// `transform()` can return a `{ newProp, value }` object to indicate the
// property name has been moved.
//  - It does not move the property.
//  - Instead, it indicates it's been moved so error messages show the name
//    of the property before being moved
const isTransformMove = function (definition) {
  return (
    typeof definition === 'object' &&
    definition !== null &&
    'value' in definition &&
    'newProp' in definition
  )
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
        typeof newInput === 'object' &&
        newInput !== null &&
        Object.keys(newInput).length === 1 &&
        newInput[Object.keys(newInput)[0]] === oldInput
      )
    },
    getNewProp(newInput) {
      return [Object.keys(newInput)[0]]
    },
  },
]
