import { getCombinations } from './combination/main.js'
import { checkLimits } from './compare/limit.js'
import { getConfig } from './config/main.js'
import { performDev } from './dev/main.js'
import {
  addToHistory,
  getFromHistory,
  removeFromHistory,
} from './history/main.js'
import { performRun } from './run/main.js'
import { reportResult } from './report/main.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const run = async function (configFlags) {
  const config = await getConfig('run', configFlags)
  const { result, finalResult } = await performRun(config)
  await addToHistory(result, config)
  checkLimits(finalResult, config)
  return finalResult
}

// Show a previous result
export const show = async function (configFlags) {
  const config = await getConfig('show', configFlags)
  const { result, previous } = await getFromHistory(config)
  const finalResult = await reportResult(result, previous, config)
  return finalResult
}

// Remove a previous result
export const remove = async function (configFlags) {
  const config = await getConfig('remove', configFlags)
  const { result, previous } = await getFromHistory(config)
  const finalResult = await reportResult(result, previous, config)
  await removeFromHistory(result, config)
  return finalResult
}

// Execute tasks without benchmarking them
export const dev = async function (configFlags) {
  const config = await getConfig('dev', configFlags)
  const { combinations } = await getCombinations(config)
  await performDev(config, combinations)
}
