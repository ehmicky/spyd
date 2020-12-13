// Sort an array of floats
export const sortFloats = function (array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function (numA, numB) {
  return numA - numB
}
