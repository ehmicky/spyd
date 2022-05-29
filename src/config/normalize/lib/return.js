import { applyPath } from './path.js'
import { applyRename } from './rename.js'
import { transformInput } from './transform.js'
import { addWarning } from './warn.js'

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
  return {
    input: inputA,
    config: configB,
    moves: movesB,
    warnings: warningsA,
    opts: optsA,
    skip: returnValue.skip,
  }
}
