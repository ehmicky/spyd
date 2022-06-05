import { normalizePath } from 'wild-wild-parser'

import { wrapError } from '../../../../error/wrap.js'
import { KeywordError } from '../error.js'
import { addMove } from '../move.js'

// Keywords can give a hint on where a value has moved by returning a `path`
export const applyPath = function ({ path }, moves, { path: oldPath }) {
  if (path === undefined) {
    return
  }

  const pathA = safeNormalizePath(path)

  if (pathA.length !== 0) {
    addMove(moves, oldPath, [...oldPath, ...pathA])
  }
}

const safeNormalizePath = function (path) {
  try {
    return normalizePath(path)
  } catch (error) {
    throw wrapError(error, 'The "path" is invalid:', KeywordError)
  }
}
