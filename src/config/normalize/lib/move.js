import { isParentPath, isSamePath } from 'wild-wild-parser'

// When a property is moved to another with `rename|path`
export const addMove = function (moves, oldNamePath, newNamePath) {
  return [...moves, { oldNamePath, newNamePath }]
}

// Rewind previous moves to retrieve the `originalName` behind a `name`.
// This ensures that error messages show the name of the property from the
// user's perspective, i.e. without any normalization.
// Any `transform()` property should record those normalizations by returning
// a `newProp` and `value` properties.
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
    return [...oldNamePath, ...namePath.slice(newNamePath.length)]
  }

  return namePath
}
