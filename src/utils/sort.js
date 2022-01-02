// Flattens an array of arrays into a single sorted array.
// The sorting order is:
//  - Values which are ahead of other values in most arrays
//  - Otherwise, values which appear first in earlier arrays
export const sortMatrix = function (arrays) {
  const values = [...new Set(arrays.flat())]
  // eslint-disable-next-line fp/no-mutating-methods
  values.sort(compareValues.bind(undefined, arrays))
  return values
}

// eslint-disable-next-line complexity, max-statements
const compareValues = function (arrays, valueA, valueB) {
  // eslint-disable-next-line fp/no-let
  let first = 0
  // eslint-disable-next-line fp/no-let
  let leads = 0

  // eslint-disable-next-line fp/no-loops
  for (const array of arrays) {
    const indexA = array.indexOf(valueA)
    const indexB = array.indexOf(valueB)

    // eslint-disable-next-line max-depth
    if (first === 0) {
      // eslint-disable-next-line fp/no-mutation
      first = getFirst(indexA, indexB)
    }

    // eslint-disable-next-line max-depth
    if (indexA !== -1 && indexB !== -1) {
      // eslint-disable-next-line fp/no-mutation
      leads += indexA > indexB ? 1 : -1
    }
  }

  if (leads > 0) {
    return 1
  }

  if (leads < 0) {
    return -1
  }

  return first
}

// eslint-disable-next-line complexity
const getFirst = function (indexA, indexB) {
  if (indexA === -1 && indexB === -1) {
    return 0
  }

  if (indexA === -1) {
    return 1
  }

  if (indexB === -1) {
    return -1
  }

  if (indexA > indexB) {
    return 1
  }

  return -1
}
