import { listCombinations } from './combination/list.js'
import { getConfig } from './config/main.js'
import { performDev } from './dev/main.js'
import { checkLimits } from './history/compare/limit.js'
import { getFromHistory, removeFromHistory } from './history/data/main.js'
import { reportResult } from './report/main.js'
import { performRun } from './run/main.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const run = async function (configFlags) {
  const config = await getConfig('run', configFlags)
  const programmaticResult = await performRun(config)
  checkLimits(programmaticResult, config)
  return programmaticResult
}

// Show a previous result
export const show = async function (configFlags) {
  const config = await getConfig('show', configFlags)
  const { rawResult, history } = await getFromHistory(config)
  const programmaticResult = await reportResult(rawResult, history, config)
  return programmaticResult
}

// Remove a previous result
export const remove = async function (configFlags) {
  const config = await getConfig('remove', configFlags)
  const { rawResult, history } = await getFromHistory(config)
  const programmaticResult = await reportResult(rawResult, history, config)
  await removeFromHistory(rawResult, config)
  return programmaticResult
}

// Execute tasks without benchmarking them
export const dev = async function (configFlags) {
  const config = await getConfig('dev', configFlags)
  const combinations = await listCombinations(config)
  await performDev(combinations, config)
}
