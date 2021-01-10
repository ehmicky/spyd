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
export const bench = async function (configFlags) {
  const configA = await getConfig('bench', configFlags)
  const configB = await startStore(configA)

  try {
    const { partialResult, stopped } = await performBenchmark(configB)
    const { result, results } = await addToStore({
      partialResult,
      config: configB,
      stopped,
    })
    const resultA = await report(result, results, configB)
    return resultA
  } finally {
    await endStore(configB)
  }
}

// Show a previous result
export const show = async function (configFlags) {
  const { delta, ...configA } = await getConfig('show', configFlags)
  const configB = await startStore(configA)

  try {
    const { result, results } = await getFromStore(delta, configB)
    const resultA = await report(result, results, configB)
    return resultA
  } finally {
    await endStore(configB)
  }
}

// Remove a previous result
export const remove = async function (configFlags) {
  const { delta, ...configA } = await getConfig('remove', configFlags)
  const configB = await startStore(configA)

  try {
    const { result } = await getFromStore(delta, configB)
    await removeFromStore(result, configB)
  } finally {
    await endStore(configA)
  }
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const configA = await getConfig('exec', configFlags)

  await performExec(configA)
}
