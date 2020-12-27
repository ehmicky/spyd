import { combinationHasErrored } from '../error/combination.js'
import { sendParams } from '../process/send.js'

// Exit each combination's process
export const exitCombinations = async function (combinations) {
  return await Promise.all(combinations.map(exitCombination))
}

const exitCombination = async function (combination) {
  if (processHasExited(combination)) {
    return combination
  }

  const newCombination = await sendParams(combination, {})

  if (combinationHasErrored(newCombination)) {
    return newCombination
  }

  await combination.childProcess
  return newCombination
}

const processHasExited = function ({ childProcess, res = {} }) {
  return (
    childProcess.exitCode !== null ||
    childProcess.signalCode !== null ||
    res.destroyed
  )
}
