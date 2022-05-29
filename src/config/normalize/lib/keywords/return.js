import { addWarning } from '../warn.js'

import { applyPath } from './path.js'
import { applyRename } from './rename.js'
import { transformInput } from './transform.js'

// Apply a keyword's return value, if any
export const applyReturnValue = function ({
  returnValue,
  state,
  state: { input, config, moves, warnings, opts },
}) {
  if (returnValue === undefined) {
    return state
  }

  const warningsA = addWarning(returnValue, warnings, opts)
  const { input: inputA, config: configA } = transformInput({
    returnValue,
    input,
    config,
    opts,
  })
  const movesA = applyPath(returnValue, moves, opts)
  const {
    config: configB,
    moves: movesB,
    opts: optsA,
  } = applyRename({
    returnValue,
    config: configA,
    moves: movesA,
    input: inputA,
    opts,
  })
  const optsB = applyOptions(returnValue, optsA)
  return {
    input: inputA,
    config: configB,
    moves: movesB,
    warnings: warningsA,
    opts: optsB,
    skip: returnValue.skip,
  }
}

// Keywords can change the options by returning an `options` property
const applyOptions = function (returnValue, opts) {
  return returnValue.options === undefined
    ? opts
    : { ...opts, ...returnValue.options }
}
