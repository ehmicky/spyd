import inquirer from 'inquirer'

import { isTtyInput } from '../../report/tty.js'
import { pickLast } from '../../utils/last.js'
import { applyMainDelta, applySinceDelta } from '../delta/find.js'
import { shortenId } from '../merge/id.js'
import { groupMetadata, ungroupMetadata } from '../merge/metadata.js'
import {
  normalizeRawResultSave,
  normalizeRawResultLoad,
} from '../serialize/main.js'

import {
  addRawResult,
  removeRawResults,
  listMetadata,
  fetchRawResults,
} from './results.js'

// Save rawResults so they can be compared or shown later.
// We do not save stopped benchmarks.
export const addToHistory = async function (rawResult, { save, cwd }) {
  if (!save) {
    return
  }

  const metadatum = getRawResultMetadatum(rawResult)
  const rawResultStr = normalizeRawResultSave(rawResult)
  await addRawResult(metadatum, rawResultStr, cwd)
}

export const DEFAULT_SAVE = false

// Remove a rawResult
export const removeFromHistory = async function (rawResults, { cwd, force }) {
  if (!(await shouldRemoveFromHistory(force))) {
    return
  }

  const metadata = rawResults.map(getRawResultMetadatum)
  await removeRawResults(metadata, cwd)
}

// Retrieve the metadatum of a rawResult
const getRawResultMetadatum = function ({ id, subId, timestamp }) {
  const idA = shortenId(id)
  return { id: idA, subId, timestamp }
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
  return { rawResult, history: historyA }
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
  const rawResultsStrs = await fetchRawResults(metadata, cwd)
  const history = rawResultsStrs.map(normalizeRawResultLoad)
  return history
}
