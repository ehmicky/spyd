// Sort an array of numbers
export const sortNumbers = function (array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function (numA, numB) {
  return numA - numB
}
