import { isDeepStrictEqual } from 'node:util'

// Compare two arrays deeply and unorderedly
export const isSameArray = function (arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) {
    return false
  }

  const matchedIndexes = new Set()
  return arrayA.every((value) => includesValue(arrayB, value, matchedIndexes))
}

const includesValue = function (arrayB, value, matchedIndexes) {
  const foundIndex = arrayB.findIndex(
    (valueB, index) =>
      !matchedIndexes.has(index) && isDeepStrictEqual(value, valueB),
  )
  matchedIndexes.add(foundIndex)
  return foundIndex !== -1
}
