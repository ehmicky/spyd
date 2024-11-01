import { isParentPath, isSamePath } from 'wild-wild-parser'

// When a property is moved to another with `rename|path`
export const addMove = (moves, oldPath, newPath) => {
  // eslint-disable-next-line fp/no-mutating-methods
  moves.push({ oldPath, newPath })
}

// Rewind previous moves to retrieve the `originalName` behind a `name`.
// This ensures that error messages show the name of the property from the
// user's perspective, i.e. without any normalization.
// Any `transform()` property should record those normalizations by returning
// a `newProp` and `value` properties.
// We automatically record those when we can: `rule.rename`, array
// normalization, etc.
export const applyMoves = (moves, path) => moves.reduceRight(applyMove, path)

const applyMove = (path, { oldPath, newPath }) => {
  if (isSamePath(newPath, path)) {
    return oldPath
  }

  if (isParentPath(newPath, path)) {
    return [...oldPath, ...path.slice(newPath.length)]
  }

  return path
}
