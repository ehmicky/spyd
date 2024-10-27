// Sort an array of floats
export const sortFloats = (array) => {
  array.sort(compareNumbers)
}

const compareNumbers = (numA, numB) => numA - numB
