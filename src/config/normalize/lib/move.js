// When a property is moved to another, record it.
export const addMoves = function (moves, newProps, name) {
  return newProps.length === 0
    ? moves
    : [...moves, ...newProps.map((newProp) => ({ oldName: name, newProp }))]
}

// Rewind previous moves to retrieve the `originalName` behind a `name`.
// This ensures that error messages show the name of the property from the
// user's perspective, i.e. without any normalization.
// Any `transform()` property should record those normalizations by returning
// a `newProp` and `value` properties.
// We automatically record those when we can: `rule.rename`, array
// normalization, etc.
export const applyMoves = function (moves, name) {
  return moves.reduceRight(applyMove, name)
}

const applyMove = function (name, { oldName, newProp }) {
  if (name === newProp) {
    return oldName
  }

  if (name.startsWith(`${newProp}.`)) {
    return name.replace(newProp, oldName)
  }

  return name
}
