export const name = 'transform'

export const input = true

// Apply `transform(value, opts)` which transforms the value set by the user.
// If can also delete it by returning `undefined`.
export const main = function (transform, value) {
  const { value: valueA, newProp } = isTransformMove(transform)
    ? transform
    : {
        value: transform,
        newProp: findCommonMove(transform, value),
      }
  return { value: valueA, path: newProp }
}

// `transform()` can return a `{ newProp, value }` object to indicate the
// property name has been moved.
//  - It does not move the property.
//  - Instead, it indicates it's been moved so error messages show the name
//    of the property before being moved
const isTransformMove = function (transform) {
  return (
    typeof transform === 'object' &&
    transform !== null &&
    'value' in transform &&
    'newProp' in transform
  )
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
        typeof newValue === 'object' &&
        newValue !== null &&
        Object.keys(newValue).length === 1 &&
        newValue[Object.keys(newValue)[0]] === oldValue
      )
    },
    getNewProp(newValue) {
      return [Object.keys(newValue)[0]]
    },
  },
]
