import { addWarning } from '../warn.js'

import { applyPath } from './path.js'
import { applyRename } from './rename.js'
import { transformInput } from './transform.js'

// Apply a keyword's return value, if any
export const applyReturnValue = function ({
  returnValue,
  state,
  state: { input, inputs, moves, warnings, opts },
}) {
  if (returnValue === undefined) {
    return state
  }

  const warningsA = addWarning(returnValue, warnings, opts)
  const { input: inputA, inputs: inputsA } = transformInput({
    returnValue,
    input,
    inputs,
    opts,
  })
  const movesA = applyPath(returnValue, moves, opts)
  const {
    inputs: inputsB,
    moves: movesB,
    opts: optsA,
  } = applyRename({
    returnValue,
    inputs: inputsA,
    moves: movesA,
    input: inputA,
    opts,
  })
  const optsB = applyOptions(returnValue, optsA)
  return {
    input: inputA,
    inputs: inputsB,
    moves: movesB,
    warnings: warningsA,
    opts: optsB,
    skip: returnValue.skip,
  }
}

// Keywords can change the options by returning an `options` property.
// Some `options` cannot be changed since they are too internal and might create
// issues.
const applyOptions = function (returnValue, opts) {
  if (returnValue.options === undefined) {
    return opts
  }

  // eslint-disable-next-line no-unused-vars
  const { name, path, originalName, originalPath, inputs, ...newOpts } = opts
  return { ...opts, ...newOpts }
}
