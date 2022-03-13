import { isParentPath, isSamePath } from './wild_wild_path_parser/main.js'

// When a property is moved to another, record it.
export const addMoves = function (moves, newPaths, oldNamePath) {
  return newPaths.length === 0
    ? moves
    : [
        ...moves,
        ...newPaths.map((newNamePath) => ({ oldNamePath, newNamePath })),
      ]
}

// Rewind previous moves to retrieve the `originalName` behind a `name`.
// This ensures that error messages show the name of the property from the
// user's perspective, i.e. without any normalization.
// Any `transform()` property should record those normalizations by returning
// a `newName` and `value` properties.
// We automatically record those when we can: `rule.rename`, array
// normalization, etc.
export const applyMoves = function (moves, namePath) {
  return moves.reduceRight(applyMove, namePath)
}

const applyMove = function (namePath, { oldNamePath, newNamePath }) {
  if (isSamePath(newNamePath, namePath)) {
    return oldNamePath
  }

  if (isParentPath(newNamePath, namePath)) {
    return [...oldNamePath, namePath.slice(0, newNamePath.length)]
  }

  return namePath
}
