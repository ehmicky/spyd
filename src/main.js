import { checkLimits } from './compare/limit.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec/main.js'
import { performBenchmark } from './measure/bench.js'
import { report } from './report/main.js'
import {
  addToStore,
  getFromStore,
  listAll,
  listStore,
  removeFromStore,
} from './store/main.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const bench = async function (configFlags) {
  const confiA = await getConfig('bench', configFlags)
  const results = await listAll(confiA)
  const { rawResult, result, stopped } = await performBenchmark(confiA, results)
  await addToStore(rawResult, confiA, stopped)
  await report(result, confiA)
  checkLimits(result, confiA)
  return result
}

// Show a previous result
export const show = async function (configFlags) {
  const { delta, ...configA } = await getConfig('show', configFlags)
  const results = await listStore(configA)
  const result = await getFromStore(results, delta, configA)
  await report(result, configA)
  return result
}

// Remove a previous result
export const remove = async function (configFlags) {
  const { delta, ...configA } = await getConfig('remove', configFlags)
  const results = await listStore(configA)
  const result = await getFromStore(results, delta, configA)
  await removeFromStore(result, configA)
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const configA = await getConfig('exec', configFlags)
  await performExec(configA)
}
