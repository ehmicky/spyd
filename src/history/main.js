import inquirer from 'inquirer'

import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/main.js'
import { UserError } from '../error/main.js'
import { isTtyInput } from '../report/tty.js'

import { compressResult } from './normalize/compress.js'
import { loadResults } from './normalize/load.js'
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

  const { confirmed } = await inquirer.prompt([
    { type: 'confirm', name: 'confirmed', message: 'Remove the result?' },
  ])
  return confirmed
}

// Get a previous result by delta
export const getFromHistory = async function (config) {
  const results = await listHistory(config)
  const { result, previous } = await listResultsByDelta(results, config)
  return { result, previous }
}

// List, sort, filter and normalize all results
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in results preview
export const listHistory = async function ({ cwd, select }) {
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
