import omit from 'omit.js'

import { UserError } from '../error/main.js'

import { listStore } from './list.js'
import { mergeResults } from './merge.js'

// Add a new result
export const addToStore = async function ({ result, config, stopped }) {
  await save({ result, config, stopped })

  const results = await listStore(config)
  const resultsA = [...results, result]
  const resultsB = mergeResults(resultsA)
  const resultA = resultsB[resultsB.length - 1]
  return resultA
}

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
const save = async function ({
  result,
  config: { save: saveConfig, store },
  stopped,
}) {
  if (!saveConfig || stopped) {
    return
  }

  const resultA = normalizeSaveResult(result)

  try {
    await store.add(resultA)
  } catch (error) {
    throw new UserError(`Could not save result: ${error.message}`)
  }
}

// Results that are too big are not persisted.
// We otherwise try to persist everything, so that `show` report the same
// information.
// We try to only persist what cannot be computed runtime (which is done by
// `addPrintedInfo()` during reporting).
const normalizeSaveResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(normalizeCombination)
  return { ...result, combinations: combinationsA }
}

const normalizeCombination = function ({ stats, ...combination }) {
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...combination, stats: statsA }
}

const OMITTED_STATS_PROPS = ['histogram', 'quantiles']
