import { fastEqualsSimple, isSameToken } from '../parsing/compare.js'

// Remove duplicate entries
export const removeDuplicates = function (entries) {
  return entries.length === 1 ? entries : entries.filter(isNotDuplicate)
}

const isNotDuplicate = function (entryA, index, entries) {
  return entries.every(
    (entryB, indexB) => index <= indexB || !isDuplicate(entryA, entryB),
  )
}

const isDuplicate = function (
  { simplePath: simplePathA, path: pathA },
  { simplePath: simplePathB, path: pathB },
) {
  return (
    fastEqualsSimple(simplePathA, simplePathB) &&
    pathA.length === pathB.length &&
    pathA.every(
      (tokenA, index) =>
        index < simplePathA.length || isSameToken(tokenA, pathB[index]),
    )
  )
}
