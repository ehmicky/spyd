import { addWarning } from '../warn.js'

import { applyPath } from './path.js'
import { applyRename } from './rename.js'
import { transformInput } from './transform.js'

// Apply a keyword's return value, if any
export const applyReturnValue = function ({
  returnValue,
  state,
  state: { input, inputs, moves, warnings, info },
}) {
  if (returnValue === undefined) {
    return state
  }

  const warningsA = addWarning(returnValue, warnings, info)
  const { input: inputA, inputs: inputsA } = transformInput({
    returnValue,
    input,
    inputs,
    info,
  })
  const movesA = applyPath(returnValue, moves, info)
  const {
    inputs: inputsB,
    moves: movesB,
    info: infoA,
  } = applyRename({
    returnValue,
    inputs: inputsA,
    moves: movesA,
    input: inputA,
    info,
  })
  const infoB = applyInfo(returnValue, infoA)
  return {
    input: inputA,
    inputs: inputsB,
    moves: movesB,
    warnings: warningsA,
    info: infoB,
    skip: returnValue.skip,
  }
}

// Keywords can change the `info` by returning an `info` property.
// Some `info` properties cannot be changed since they are too internal and
// might create issues.
const applyInfo = function (returnValue, info) {
  if (returnValue.info === undefined) {
    return info
  }

  // eslint-disable-next-line no-unused-vars
  const { name, path, originalName, originalPath, inputs, ...newInfo } =
    returnValue.info
  return { ...info, ...newInfo }
}
