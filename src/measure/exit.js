import { combinationHasErrored } from '../error/combination.js'
import { sendParams } from '../process/send.js'

// Exit each combination's process
export const exitCombination = async function (combination, childProcess) {
  if (processHasExited(childProcess, combination)) {
    return combination
  }

  const newCombination = await sendParams(combination, {})

  if (combinationHasErrored(newCombination)) {
    return newCombination
  }

  await childProcess
  return newCombination
}

const processHasExited = function ({ exitCode, signalCode }, { res = {} }) {
  return exitCode !== null || signalCode !== null || res.destroyed
}
