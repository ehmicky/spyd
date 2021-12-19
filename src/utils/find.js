// Like `array.find(func)` but returns the return value of func() instead of
// the element in `array`.
export const findValue = function (iterable, func) {
  // eslint-disable-next-line fp/no-loops
  for (const value of iterable) {
    const returnValue = func(value)

    // eslint-disable-next-line max-depth
    if (returnValue !== undefined) {
      return [returnValue, value]
    }
  }
}

// Like `Array.findLast()`.
// TODO: replace with `Array.findLast()` once this is supported by all
// supported Node.js versions.
// Use imperative code for performance.
export const findLast = function (array, testFunc) {
  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = array.length - 1; index >= 0; index -= 1) {
    const value = array[index]

    // eslint-disable-next-line max-depth
    if (testFunc(value, index, array)) {
      return value
    }
  }
}

// Like `Array.findLastIndex()`.
// TODO: replace with `Array.findLastIndex()` once this is supported by all
// supported Node.js versions.
// Use imperative code for performance.
export const findLastIndex = function (array, testFunc) {
  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = array.length - 1; index >= 0; index -= 1) {
    // eslint-disable-next-line max-depth
    if (testFunc(array[index], index, array)) {
      return index
    }
  }

  return -1
}
