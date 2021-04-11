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
import { reportBench, reportShow, reportRemove } from './report/main.js'
import { startReporters } from './report/start_end.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const bench = async function (configFlags) {
  const config = await getConfig('bench', configFlags)
  const [{ combinations, systemVersions }, configA] = await Promise.all([
    getCombinations(config),
    startReporters(config),
  ])
  const { rawResult, result } = await performBenchmark(
    configA,
    combinations,
    systemVersions,
  )
  await Promise.all([
    addToHistory(rawResult, configA),
    reportBench(result, configA),
  ])
  checkLimits(result, configA)
  return result
}

// Show a previous result
export const show = async function (configFlags) {
  const config = await getConfig('show', configFlags)
  const [result, configA] = await Promise.all([
    getFromHistory(config),
    startReporters(config),
  ])
  await reportShow(result, configA)
  return result
}

// Remove a previous result
export const remove = async function (configFlags) {
  const config = await getConfig('remove', configFlags)
  const [result, configA] = await Promise.all([
    getFromHistory(config),
    startReporters(config),
  ])
  await reportRemove(result, configA)
  await removeFromHistory(result, configA)
  return result
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const config = await getConfig('exec', configFlags)
  const { combinations } = await getCombinations({ ...config, duration: 1 })
  await performExec(config, combinations)
}
