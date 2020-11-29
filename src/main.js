import { getOpts } from './config/main.js'
import { performDebug } from './debug.js'
import { report } from './report/main.js'
import { performRun } from './run.js'
import { addToStore } from './store/add.js'
import { endStore } from './store/end.js'
import { getFromStore } from './store/get.js'
import { removeFromStore } from './store/remove.js'
import { startStore } from './store/start.js'

// Measure code defined in a tasks file and report the results.
// Default action.
export const run = async function (opts) {
  const optsA = await getOpts('run', opts)
  const optsB = await startStore(optsA)

  try {
    const partialResult = await performRun(optsB)
    const { mergeId, results } = await addToStore(partialResult, optsB)
    const result = await report(mergeId, results, optsB)
    return result
  } finally {
    await endStore(optsB)
  }
}

// Show a previous result
export const show = async function (opts) {
  const { delta, ...optsA } = await getOpts('show', opts)
  const optsB = await startStore(optsA)

  try {
    const { mergeId, results } = await getFromStore(delta, optsB)
    const result = await report(mergeId, results, optsB)
    return result
  } finally {
    await endStore(optsB)
  }
}

// Remove a previous result
export const remove = async function (opts) {
  const { delta, ...optsA } = await getOpts('remove', opts)
  const optsB = await startStore(optsA)

  try {
    const { mergeId, partialResults } = await getFromStore(delta, optsB)
    await removeFromStore(mergeId, partialResults, optsB)
  } finally {
    await endStore(optsA)
  }
}

// Run tasks in debug mode
export const debug = async function (opts) {
  const optsA = await getOpts('debug', opts)

  await performDebug(optsA)
}
