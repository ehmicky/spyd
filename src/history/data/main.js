import inquirer from 'inquirer'

import { UserError } from '../../error/main.js'
import { isTtyInput } from '../../report/tty.js'
import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/find.js'
import { compressRawResult } from '../normalize/compress.js'
import { loadRawResults } from '../normalize/load.js'

import { addRawResult, removeRawResult, listRawResults } from './results.js'

// Save rawResults so they can be compared or shown later.
// We do not save stopped benchmarks.
export const addToHistory = async function (rawResult, { save, cwd }) {
  if (!save) {
    return
  }

  const rawResultA = compressRawResult(rawResult)
  await addRawResult(rawResultA, cwd)
}

// Remove a rawResult
export const removeFromHistory = async function ({ id }, { cwd, force }) {
  if (!(await shouldRemoveFromHistory(force))) {
    return
  }

  await removeRawResult(id, cwd)
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

// Get a previous rawResult by delta
export const getFromHistory = async function (config) {
  const rawResults = await listHistory(config)
  const { rawResult, previous } = await listResultsByDelta(rawResults, config)
  return { rawResult, previous }
}

// List, sort, filter and normalize all rawResults
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in rawResults preview
export const listHistory = async function ({ cwd, select }) {
  const rawResults = await listRawResults(cwd)
  const rawResultsA = loadRawResults(rawResults, select)
  return rawResultsA
}

const listResultsByDelta = async function (rawResults, { delta, cwd }) {
  if (rawResults.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(rawResults, delta, cwd)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  const rawResult = rawResults[index]
  const previous = rawResults.slice(0, index)
  return { rawResult, previous }
}
