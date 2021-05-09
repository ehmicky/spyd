import { prompt } from 'inquirer'

import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/main.js'
import { UserError } from '../error/main.js'
import { compressResult } from '../normalize/compress.js'
import { loadResults } from '../normalize/load.js'
import { mergeResults } from '../normalize/merge.js'
import { applySince, mergeLastCombinations } from '../normalize/since.js'
import { isTtyInput } from '../report/tty.js'

import { addResult, removeResult, listResults } from './results.js'

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
export const addToHistory = async function (result, { save, cwd }) {
  if (!save) {
    return
  }

  const resultA = compressResult(result)
  await addResult(resultA, cwd)
}

// Remove a result
export const removeFromHistory = async function ({ id }, { cwd, force }) {
  if (!(await shouldRemoveFromHistory(force))) {
    return
  }

  await removeResult(id, cwd)
}

const shouldRemoveFromHistory = async function (force) {
  if (force || !isTtyInput()) {
    return true
  }

  const { confirmed } = await prompt([
    { type: 'confirm', name: 'confirmed', message: 'Remove the result?' },
  ])
  return confirmed
}

// Retrieve all results.
// We try to apply `since` as soon as possible so user errors with that
// configuration property fail early.
export const listHistory = async function (config) {
  const previous = await listLoadedResults(config)
  const history = await applySince(previous, config)
  return { previous, history }
}

// Get a previous result by delta
export const getFromHistory = async function (config) {
  const results = await listLoadedResults(config)
  const { result, previous } = await listResultsByDelta(results, config)
  const history = await applySince(previous, config)
  const resultA = mergeLastCombinations(result, history)
  const resultB = mergeResults(resultA, previous, history)
  return resultB
}

// List, sort, filter and normalize all results
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in results preview
const listLoadedResults = async function ({ cwd, select }) {
  const results = await listResults(cwd)
  const resultsA = loadResults(results, select)
  return resultsA
}

const listResultsByDelta = async function (results, { delta, cwd }) {
  if (results.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(results, delta, cwd)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  const result = results[index]
  const previous = results.slice(0, index)
  return { result, previous }
}
