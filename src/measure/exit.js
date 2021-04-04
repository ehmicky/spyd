import { sendParams } from '../process/send.js'

// Exit each combination's process
export const exitCombination = async function (combination, childProcess) {
  if (processHasExited(childProcess, combination)) {
    return
  }

  await Promise.all([sendParams(combination, {}), childProcess])
}

const processHasExited = function ({ exitCode, signalCode }, { res = {} }) {
  return exitCode !== null || signalCode !== null || res.destroyed
}
