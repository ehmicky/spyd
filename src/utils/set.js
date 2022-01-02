// Set an array's element in a functional way
export const setArray = function (array, index, element) {
  const arrayCopy = [...array]
  // eslint-disable-next-line fp/no-mutation
  arrayCopy[index] = element
  return arrayCopy
}
