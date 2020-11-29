import omit from 'omit.js'

import { UserError } from '../error/main.js'
import { addMergeId } from '../merge/config.js'
import { mergePartialResults } from '../merge/partial.js'

import { listStore } from './list.js'

// Add a new result
export const addToStore = async function (partialResult, config) {
  const partialResults = await listStore(config)

  const partialResultA = addMergeId(partialResult, partialResults, config)
  await save(partialResultA, config)

  const partialResultsA = [...partialResults, partialResultA]
  const results = mergePartialResults(partialResultsA)

  return { mergeId: partialResultA.mergeId, results }
}

// Save results so they can be compared or shown later
const save = async function (result, { save: saveConfig, store }) {
  if (!saveConfig) {
    return
  }

  const resultA = normalizeResult(result)

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
// `addPrintedInfo()` during reporting). This includes
// `combination.row|column` which are only computed for progress reporters,
// but re-computed after previous results loading/merging.
const normalizeResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(normalizeCombination)
  return { ...result, combinations: combinationsA }
}

const normalizeCombination = function ({ stats, ...combination }) {
  const combinationA = omit(combination, OMITTED_PROPS)
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...combinationA, stats: statsA }
}

const OMITTED_PROPS = ['row', 'column']
const OMITTED_STATS_PROPS = ['histogram', 'quantiles']
