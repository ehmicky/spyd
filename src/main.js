import { getCombinations } from './combination/main.js'
import { checkLimits } from './compare/limit.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec/main.js'
import {
  addToHistory,
  getFromHistory,
  removeFromHistory,
} from './history/main.js'
import { performBenchmark } from './measure/bench.js'
import { printPreviewStarting } from './preview/start_end.js'
import { reportBenchShow, reportRemove } from './report/main.js'
import { startReporters } from './report/start_end.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const bench = async function (configFlags) {
  const config = await getConfig('bench', configFlags)
  printPreviewStarting(config)
  const configA = await startReporters(config)
  const result = await performBenchmark(configA)
  await addToHistory(result, configA)
  const resultA = await reportBenchShow(result, configA)
  checkLimits(resultA, configA)
  return resultA
}

// Show a previous result
export const show = async function (configFlags) {
  const config = await getConfig('show', configFlags)
  const [result, configA] = await Promise.all([
    getFromHistory(config),
    startReporters(config),
  ])
  const resultA = await reportBenchShow(result, configA)
  return resultA
}

// Remove a previous result
export const remove = async function (configFlags) {
  const config = await getConfig('remove', configFlags)
  const [result, configA] = await Promise.all([
    getFromHistory(config),
    startReporters(config),
  ])
  const resultA = await reportRemove(result, configA)
  await removeFromHistory(resultA, configA)
  return resultA
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const config = await getConfig('exec', configFlags)
  const { combinations } = await getCombinations(config)
  await performExec(config, combinations)
}
