import inquirer from 'inquirer'

import { isTtyInput } from '../../report/tty.js'
import { pickLast } from '../../utils/last.js'
import { applyMainDelta, applySinceDelta } from '../delta/find.js'
import { groupMetadata, ungroupMetadata } from '../merge/metadata.js'
import { compressRawResult } from '../normalize/compress.js'
import { loadRawResults, normalizePreviousResults } from '../normalize/load.js'

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
  const metadataGroups = await listSortedMetadata(config)
  const metadataGroupsA = await applyMainDelta(metadataGroups, config)
  const [metadataGroupsB, targetMetadataGroup] = pickLast(metadataGroupsA)
  const metadataGroupsC = await applySinceDelta(metadataGroupsB, config)
  const metadataGroupsD = [...metadataGroupsC, targetMetadataGroup]
  const history = await fetchHistory(metadataGroupsD, config)
  const [historyA, rawResult] = pickLast(history)
  const { targetResult: rawResultA, history: historyB } =
    normalizePreviousResults(rawResult, historyA, config)
  return { rawResult: rawResultA, history: historyB }
}

// List all history results, after applying the `since` delta.
export const listHistory = async function (config) {
  const metadataGroups = await listSortedMetadata(config)
  const metadataGroupsA = await applySinceDelta(metadataGroups, config)
  const history = await fetchHistory(metadataGroupsA, config)
  return history
}

const listSortedMetadata = async function ({ cwd }) {
  const metadata = await listMetadata(cwd)
  const metadataGroups = groupMetadata(metadata)
  return metadataGroups
}

// List, sort, filter and normalize the history rawResults.
// The start and end of the history depends on the main and the `since` deltas.
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in rawResults preview
const fetchHistory = async function (metadataGroups, { cwd }) {
  const metadata = ungroupMetadata(metadataGroups)
  const rawResults = await fetchRawResults(metadata, cwd)
  const history = loadRawResults(rawResults)
  return history
}
