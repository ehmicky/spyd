import { normalizePath } from 'wild-wild-parser'

import { wrapError } from '../../../../error/wrap.js'
import { addMove } from '../move.js'

// Keywords can give a hint on where a value has moved by returning a `path`
export const applyPath = function (
  { path },
  moves,
  { funcOpts: { path: oldNamePath } },
) {
  if (path === undefined) {
    return moves
  }

  const pathA = safeNormalizePath(path)

  if (pathA.length === 0) {
    return moves
  }

  const newNamePath = [...oldNamePath, ...pathA]
  return addMove(moves, oldNamePath, newNamePath)
}

const safeNormalizePath = function (path) {
  try {
    return normalizePath(path)
  } catch (error) {
    throw wrapError(error, 'The "path" is invalid:')
  }
}
