// Sort an array of floats
export const sortFloats = (array) => {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = (numA, numB) => numA - numB
