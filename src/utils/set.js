// Set an array's element in a functional way
export const setArray = function (array, indexOrProp, element) {
  const arrayCopy = [...array]
  // eslint-disable-next-line fp/no-mutation
  arrayCopy[indexOrProp] = element
  return arrayCopy
}
