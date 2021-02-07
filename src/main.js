import { checkLimits } from './compare/limit.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec/main.js'
import { performBenchmark } from './measure/bench.js'
import { report } from './report/main.js'
import { addToStore } from './store/add.js'
import { getFromStore } from './store/get.js'
import { listAll, listStore } from './store/list.js'
import { removeFromStore } from './store/remove.js'
import { startStore } from './store/start.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const bench = async function (configFlags) {
  const configA = await getConfig('bench', configFlags)
  const configB = await startStore(configA)

  const results = await listAll(configB)
  const { rawResult, result, stopped } = await performBenchmark(
    configB,
    results,
  )
  await addToStore(rawResult, configB, stopped)
  await report(result, configB)
  checkLimits(result, configB)
  return result
}

// Show a previous result
export const show = async function (configFlags) {
  const { delta, ...configA } = await getConfig('show', configFlags)
  const configB = await startStore(configA)

  const results = await listStore(configB)
  const result = await getFromStore(results, delta, configB)
  await report(result, configB)
  return result
}

// Remove a previous result
export const remove = async function (configFlags) {
  const { delta, ...configA } = await getConfig('remove', configFlags)
  const configB = await startStore(configA)

  const results = await listStore(configB)
  const result = await getFromStore(results, delta, configB)
  await removeFromStore(result, configB)
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const configA = await getConfig('exec', configFlags)

  await performExec(configA)
}
