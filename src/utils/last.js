// Like `[...array, lastElement]`
export const pickLast = function (array) {
  const arrayA = array.slice(0, -1)
  const lastElement = array[array.length - 1]
  return [arrayA, lastElement]
}