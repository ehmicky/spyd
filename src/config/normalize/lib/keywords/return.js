import { addWarning } from '../warn.js'

import { applyPath } from './path.js'
import { applyRename } from './rename.js'
import { transformInput } from './transform.js'

// Apply a keyword's return value, if any
export const applyReturnValue = function ({
  returnValue,
  memo,
  memo: { input, info },
  state,
  state: { warnings, moves },
}) {
  if (returnValue === undefined) {
    return memo
  }

  addWarning(returnValue, warnings, info)
  const inputA = transformInput({ returnValue, input, state, info })
  applyPath(returnValue, moves, info)
  const infoA = applyRename({ returnValue, state, input: inputA, info })
  const infoB = applyInfo(returnValue, infoA)
  return { input: inputA, info: infoB, skip: returnValue.skip }
}

// Keywords can change the `info` by returning an `info` property.
// Some `info` properties cannot be changed since they are too internal and
// might create issues.
const applyInfo = function (returnValue, info) {
  if (returnValue.info === undefined) {
    return info
  }

  // eslint-disable-next-line no-unused-vars
  const { name, path, inputs, ...newInfo } = returnValue.info
  return { ...info, ...newInfo }
}
