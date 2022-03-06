import { parent } from './star_dot_path/parsing/parent.js'

// When a property is moved to another, record it.
export const addMoves = function (moves, newNames, oldName) {
  return newNames.length === 0
    ? moves
    : [...moves, ...newNames.map((newName) => ({ oldName, newName }))]
}

// Rewind previous moves to retrieve the `originalName` behind a `name`.
// This ensures that error messages show the name of the property from the
// user's perspective, i.e. without any normalization.
// Any `transform()` property should record those normalizations by returning
// a `newName` and `value` properties.
// We automatically record those when we can: `rule.rename`, array
// normalization, etc.
export const applyMoves = function (moves, name) {
  return moves.reduceRight(applyMove, name)
}

const applyMove = function (name, { oldName, newName }) {
  if (newName === name) {
    return oldName
  }

  if (parent(newName, name)) {
    return name.replace(newName, oldName)
  }

  return name
}
