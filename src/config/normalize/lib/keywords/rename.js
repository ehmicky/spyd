import { serializePath, normalizePath } from 'wild-wild-parser'
import { remove } from 'wild-wild-path'

import { wrapError } from '../../../../error/wrap.js'
import { KeywordError } from '../error.js'
import { addMove } from '../move.js'

import { setInputs } from './set.js'

// Keywords can move the input by returning a `rename` property
export const applyRename = function ({
  returnValue: { rename },
  inputs,
  moves,
  input,
  info,
  info: { name: oldName, path: oldPath },
}) {
  if (rename === undefined) {
    return { inputs, moves, info }
  }

  const newPath = safeNormalizePath(rename)
  const newName = serializePath(newPath)

  if (newName === oldName) {
    return { inputs, moves, info }
  }

  const inputsA = remove(inputs, oldPath)
  const inputsB = setInputs(inputsA, newPath, input)
  const movesA = addMove(moves, oldPath, newPath)
  return {
    inputs: inputsB,
    moves: movesA,
    info: { ...info, path: newPath, name: newName },
  }
}

// `keyword.normalize()` should apply `normalizePath()` when possible, for
// performance reasons, and so that this is reported as a `DefinitionError`
// instead of `KeywordError`. But we do it again, to check for keyword bugs.
const safeNormalizePath = function (rename) {
  try {
    return normalizePath(rename)
  } catch (error) {
    throw wrapError(error, 'The "rename" path is invalid:', KeywordError)
  }
}
