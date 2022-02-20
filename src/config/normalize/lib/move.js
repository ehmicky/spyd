// When a property is moved to another, record it.
export const addMoves = function (moves, newPaths, name) {
  return newPaths.length === 0
    ? moves
    : [...moves, ...newPaths.map((newPath) => ({ oldPath: name, newPath }))]
}

// Rewind previous moves to retrieve the `originalName` behind a `name`.
// This ensures that error messages show the name of the property from the
// user's perspective, i.e. without any normalization.
// Any `transform()` property should record those normalizations by returning
// a `newPath` and `value` properties.
// We automatically record those when we can: `rule.rename`, array
// normalization, etc.
export const applyMoves = function (moves, name) {
  return moves.reduceRight(applyMove, name)
}

const applyMove = function (name, { oldPath, newPath }) {
  if (name === newPath) {
    return oldPath
  }

  if (name.startsWith(`${newPath}.`)) {
    return name.replace(newPath, oldPath)
  }

  return name
}
