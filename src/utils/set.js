// Set an array's element in a functional way:
//  - Does not modify the original array
//  - Only creates a copy when the new array's element is different
export const setArrayElement = function (array, index, element) {
  if (array[index] === element) {
    return array
  }

  const arrayCopy = [...array]
  // eslint-disable-next-line fp/no-mutation
  arrayCopy[index] = element
  return arrayCopy
}
