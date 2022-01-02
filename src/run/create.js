import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { normalizeRawResults } from '../history/normalize/load.js'
import { createSystemInfo } from '../system/create.js'
import { addSystemVersions } from '../system/versions.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const [rawResult, history] = await Promise.all([
    createRawResult(config),
    listHistory(config),
  ])
  const { targetResult: rawResultA, history: historyA } = normalizeRawResults(
    rawResult,
    history,
    config,
  )
  const rawResultB = await addSystemVersions(rawResultA, config)
  return { rawResult: rawResultB, history: historyA }
}

const createRawResult = async function (config) {
  const combinations = await listCombinations(config)
  const { id, mergeId, timestamp, systems } = createSystemInfo(config)
  return { id, mergeId, timestamp, systems, combinations }
}
