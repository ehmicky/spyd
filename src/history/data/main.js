import inquirer from 'inquirer'

import { isTtyInput } from '../../report/tty.js'
import { applyMainDelta, applySinceDelta } from '../delta/find.js'
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
  const metadata = await listMetadata(config.cwd)
  const metadataA = await applyMainDelta(metadata, config)
  const targetMetadata = metadataA[metadataA.length - 1]
  const metadataB = metadataA.slice(0, -1)
  const metadataC = await applySinceDelta(metadataB, config)
  const metadataD = [...metadataC, targetMetadata]
  const history = await listHistory(metadataD, config)
  const rawResult = history[history.length - 1]
  const historyA = history.slice(0, -1)
  return { rawResult, history: historyA }
}

export const listHistoryForRun = async function (config) {
  const metadata = await listMetadata(config.cwd)
  const metadataA = await applySinceDelta(metadata, config)
  const history = await listHistory(metadataA, config)
  return history
}

// List, sort, filter and normalize the history rawResults.
// The start and end of the history depends on the main and the `since` deltas.
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in rawResults preview
const listHistory = async function (metadata, { cwd, select }) {
  const ids = metadata.map(getMetadatumId)
  const rawResults = await fetchResults(ids, cwd)
  const history = loadRawResults(rawResults, select)
  return history
}

const getMetadatumId = function ({ id }) {
  return id
}
