import {
  isParentPath,
  isSamePath,
  normalizePath,
  serializePath,
} from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

// Normalize `rename`'s path
export const getRenamedPath = function (rename) {
  const newNamePath = safeNormalizePath(rename)
  const newNameString = serializePath(newNamePath)
  return { newNamePath, newNameString }
}

// Normalize `path`'s path
export const getMovedPath = function (path, oldNamePath) {
  return [...oldNamePath, ...safeNormalizePath(path)]
}

const safeNormalizePath = function (path) {
  try {
    return normalizePath(path)
  } catch (error) {
    throw wrapError(error, 'The returned "path" is invalid:')
  }
}

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
    return [...oldNamePath, namePath.slice(0, newNamePath.length)]
  }

  return namePath
}
