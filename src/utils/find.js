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
