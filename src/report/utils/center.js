import stringWidth from 'string-width'

// Center a string at a specific `index` inside a container of a given `width`
// Ensures the string is usually centered around `index` except when at the
// start or end of the container.
export const centerString = (string, index, width) => {
  const stringLength = stringWidth(string)
  const leftShift = Math.max(Math.floor((stringLength - 1) / 2), 0)
  const shiftedIndex = index - leftShift
  const maxIndex = width - stringLength
  const finalIndex = Math.min(Math.max(shiftedIndex, 0), maxIndex)
  const leftSpace = ' '.repeat(finalIndex)
  const rightSpace = ' '.repeat(width - stringLength - finalIndex)
  return `${leftSpace}${string}${rightSpace}`
}
