import inquirer from 'inquirer'
import sortOn from 'sort-on'

import { isTtyInput } from '../../report/tty.js'
import { pickLast } from '../../utils/last.js'
import { applyMainDelta, applySinceDelta } from '../delta/find.js'
import { compressRawResult } from '../normalize/compress.js'
import { loadRawResults, normalizeRawResults } from '../normalize/load.js'

import {
  addRawResult,
  removeRawResult,
  listMetadata,
  fetchRawResults,
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
export const removeFromHistory = async function (rawResult, { cwd, force }) {
  if (!(await shouldRemoveFromHistory(force))) {
    return
  }

  await removeRawResult(rawResult, cwd)
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

// Find the target result using the main delta.
// Then, list all history results, after applying the `since` delta.
export const getFromHistory = async function (config) {
  const metadata = await listSortedMetadata(config)
  const metadataA = await applyMainDelta(metadata, config)
  const [metadataB, targetMetadata] = pickLast(metadataA)
  const metadataC = await applySinceDelta(metadataB, config)
  const metadataD = [...metadataC, targetMetadata]
  const history = await fetchHistory(metadataD, config)
  const [historyA, targetResult] = pickLast(history)
  const { targetResult: rawResult, history: historyB } = normalizeRawResults(
    targetResult,
    historyA,
    config,
  )
  return { rawResult, history: historyB }
}

// List all history results, after applying the `since` delta.
export const listHistory = async function (config) {
  const metadata = await listSortedMetadata(config)
  const metadataA = await applySinceDelta(metadata, config)
  const history = await fetchHistory(metadataA, config)
  return history
}

const listSortedMetadata = async function ({ cwd }) {
  const metadata = await listMetadata(cwd)
  return sortOn(metadata, 'timestamp')
}

// List, sort, filter and normalize the history rawResults.
// The start and end of the history depends on the main and the `since` deltas.
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in rawResults preview
const fetchHistory = async function (metadata, { cwd }) {
  const rawResults = await fetchRawResults(metadata, cwd)
  const history = loadRawResults(rawResults)
  return history
}
