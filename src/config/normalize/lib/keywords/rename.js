import { serializePath, normalizePath } from 'wild-wild-parser'
import { remove } from 'wild-wild-path'

import { wrapError } from '../../../../error/wrap.js'
import { addMove } from '../move.js'

import { setConfig } from './set.js'

// Keywords can move the input by returning a `rename` property
export const applyRename = function ({
  returnValue: { rename },
  config,
  moves,
  input,
  opts,
  opts: { name: oldNameString, path: oldNamePath },
}) {
  if (rename === undefined) {
    return { config, moves, opts }
  }

  const newNamePath = safeNormalizePath(rename)
  const newNameString = serializePath(newNamePath)

  if (newNameString === oldNameString) {
    return { config, moves, opts }
  }

  const configA = remove(config, oldNamePath)
  const configB = setConfig(configA, newNamePath, input)
  const movesA = addMove(moves, oldNamePath, newNamePath)
  return {
    config: configB,
    moves: movesA,
    opts: { ...opts, path: newNamePath, name: newNameString },
  }
}

const safeNormalizePath = function (path) {
  try {
    return normalizePath(path)
  } catch (error) {
    throw wrapError(error, 'The "rename" path is invalid:')
  }
}
