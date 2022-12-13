import { serializePath, normalizePath } from 'wild-wild-parser'
import { remove } from 'wild-wild-path'

import { KeywordError } from '../error.js'
import { addMove } from '../move.js'

import { setInputs } from './set.js'

// Keywords can move the input by returning a `rename` property
export const applyRename = ({
  returnValue: { rename },
  state,
  state: { inputs, moves },
  input,
  info,
  info: { name: oldName, path: oldPath },
}) => {
  if (rename === undefined) {
    return info
  }

  const newPath = safeNormalizePath(rename)
  const newName = serializePath(newPath)

  if (newName === oldName) {
    return info
  }

  const inputsA = remove(inputs, oldPath)
  state.inputs = setInputs(inputsA, newPath, input)
  addMove(moves, oldPath, newPath)
  return { ...info, path: newPath, name: newName }
}

// `keyword.normalize()` should apply `normalizePath()` when possible, for
// performance reasons, and so that this is reported as a `DefinitionError`
// instead of `KeywordError`. But we do it again, to check for keyword bugs.
const safeNormalizePath = (rename) => {
  try {
    return normalizePath(rename)
  } catch (cause) {
    throw new KeywordError('The "rename" path is invalid:\n', { cause })
  }
}
