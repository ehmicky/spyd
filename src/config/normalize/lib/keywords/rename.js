import { serializePath, normalizePath } from 'wild-wild-parser'
import { remove } from 'wild-wild-path'

import { wrapError } from '../../../../error/wrap.js'
import { addMove } from '../move.js'

import { setInputs } from './set.js'

// Keywords can move the input by returning a `rename` property
export const applyRename = function ({
  returnValue: { rename },
  inputs,
  moves,
  input,
  opts,
  opts: { name: oldName, path: oldPath },
}) {
  if (rename === undefined) {
    return { inputs, moves, opts }
  }

  const newPath = safeNormalizePath(rename)
  const newName = serializePath(newPath)

  if (newName === oldName) {
    return { inputs, moves, opts }
  }

  const inputsA = remove(inputs, oldPath)
  const inputsB = setInputs(inputsA, newPath, input)
  const movesA = addMove(moves, oldPath, newPath)
  return {
    inputs: inputsB,
    moves: movesA,
    opts: { ...opts, path: newPath, name: newName },
  }
}

const safeNormalizePath = function (rename) {
  try {
    return normalizePath(rename)
  } catch (error) {
    throw wrapError(error, 'The "rename" path is invalid:')
  }
}
