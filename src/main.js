import { performBenchmark } from './bench.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec.js'
import { report } from './report/main.js'
import { addToStore } from './store/add.js'
import { endStore } from './store/end.js'
import { getFromStore } from './store/get.js'
import { removeFromStore } from './store/remove.js'
import { startStore } from './store/start.js'

// Measure code defined in a tasks file and report the results.
// Default action.
export const bench = async function (config) {
  const configA = await getConfig('bench', config)
  const configB = await startStore(configA)

  try {
    const { partialResult, stopped } = await performBenchmark(configB)
    const { mergeId, results } = await addToStore({
      partialResult,
      config: configB,
      stopped,
    })
    const result = await report(mergeId, results, configB)
    return result
  } finally {
    await endStore(configB)
  }
}

// Show a previous result
export const show = async function (config) {
  const { delta, ...configA } = await getConfig('show', config)
  const configB = await startStore(configA)

  try {
    const { mergeId, results } = await getFromStore(delta, configB)
    const result = await report(mergeId, results, configB)
    return result
  } finally {
    await endStore(configB)
  }
}

// Remove a previous result
export const remove = async function (config) {
  const { delta, ...configA } = await getConfig('remove', config)
  const configB = await startStore(configA)

  try {
    const { mergeId, partialResults } = await getFromStore(delta, configB)
    await removeFromStore(mergeId, partialResults, configB)
  } finally {
    await endStore(configA)
  }
}

// Execute tasks without benchmarking them
export const exec = async function (config) {
  const configA = await getConfig('exec', config)

  await performExec(configA)
}
