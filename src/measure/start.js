import { throwOnProcessExit } from '../error/combination.js'
import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/receive.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
export const startCombination = async function ({
  combination,
  previewState,
  server,
  childProcess,
}) {
  const combinationA = await eStartCombination(
    combination,
    server,
    childProcess,
  )
  setDescription(previewState)
  return combinationA
}

const eStartCombination = async function (combination, server, childProcess) {
  return await Promise.race([
    throwOnProcessExit(childProcess),
    startCombinationLogic(combination, server),
  ])
}

// `calibrations` can be `undefined` if an error happened.
const startCombinationLogic = async function (combination, server) {
  const {
    newCombination,
    returnValue: { tasks, calibrations = [] },
  } = await receiveReturnValue(combination, server)
  const minLoopDuration = getMinLoopDuration(calibrations)
  return { ...newCombination, tasks, minLoopDuration }
}
