// Append two arrays in a performant way
export const appendArray = (bigArray, smallArray) => {
  const smallArrayLength = smallArray.length

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index !== smallArrayLength; index += 1) {
    // eslint-disable-next-line fp/no-mutating-methods
    bigArray.push(smallArray[index])
  }
}
