import inquirer from 'inquirer'

import { UserError } from '../../error/main.js'
import { isTtyInput } from '../../report/tty.js'
import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/find.js'
import { compressRawResult } from '../normalize/compress.js'
import { loadRawResults } from '../normalize/load.js'

import {
  addRawResult,
  removeRawResult,
  listMetadata,
  fetchResults,
} from './results.js'

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
  const history = await listHistory(config)
  const { rawResult, history: historyA } = await findTargetResult(
    history,
    config,
  )
  const historyB = await applySince(historyA, config)
  return { rawResult, history: historyB }
}

export const listHistoryForRun = async function (config) {
  const history = await listHistory(config)
  const historyA = await applySince(history, config)
  return historyA
}

// List, sort, filter and normalize all rawResults
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in rawResults preview
const listHistory = async function ({ cwd, select }) {
  const metadata = await listMetadata(cwd)
  const ids = metadata.map(({ id }) => id)
  const rawResults = await fetchResults(ids, cwd)
  const rawResultsA = loadRawResults(rawResults, select)
  return rawResultsA
}

const findTargetResult = async function (history, { delta, cwd }) {
  if (history.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(history, delta, cwd)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  const rawResult = history[index]
  const historyA = history.slice(0, index)
  return { rawResult, history: historyA }
}

const applySince = async function (history, { since, cwd }) {
  if (history.length === 0) {
    return []
  }

  const index = await findByDelta(history, since, cwd)

  if (index === -1) {
    return []
  }

  return history.slice(index)
}

// The `since` configuration property is used to limit the number of results
// shown in `result.history` which is used with time series reporters.
// `since` is used to target both the first result in time series and the one
// used for `diff` because:
//  - If is simpler to understand
//  - The `diff` must be earlier than any combination in `result.history`,
//    i.e. it makes sense to re-use `since`, and it simplifies the configuration
// `since` is relative to the main result:
//  - For `run`, this is the result being created.
//  - For `show|remove`, this is the result being reported.
//     - This ensures results reported with `show` are shown the same way as
//       when when they were measured.
//     - This is also simpler to understand since it always involves only two
//       bases (the main result and the "since" result)
// When `since` does not target any valid result, we do not show any previous
// results nor diff.
// The first item in `result.history` is the result targeted by `since`:
//  - It is shown first in time series
//     - This ensures each combination shows where it started
//     - This allows users to visualize the `diff` by comparing the first and
//       last item
// The last item in `result.history` is the current result:
//  - For `show|remove`, this is the result targeted by delta
//  - For `run`, this is the currently measured result
//  - This allows time series reporters to use `result.history`
//     - This ensures each combination shows when it was last measured
//     - This ensures the time series reflects other reporters when used
//       together
// We do not expose some `combination.history` property
//  - This would complicate the data model by creating copies of the same
//    properties.
//  - Instead, reporters should use logic to retrieve the history of each
//    combination
