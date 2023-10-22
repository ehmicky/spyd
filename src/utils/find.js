// Like `array.find(func)` but returns the return value of func() instead of
// the element in `array`.
export const findValue = (iterable, func) => {
  // eslint-disable-next-line fp/no-loops
  for (const value of iterable) {
    const returnValue = func(value)

    // eslint-disable-next-line max-depth
    if (returnValue !== undefined) {
      return returnValue
    }
  }
}

// Like `Array.findIndex(condition)` but can specify the start index.
// Uses imperative code for performance.
export const findIndexFrom = (array, condition, startIndex) => {
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = startIndex; index < array.length; index += 1) {
    const value = array[index]

    // eslint-disable-next-line max-depth
    if (condition(value, index, array)) {
      return index
    }
  }

  return -1
}
