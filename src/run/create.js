import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { normalizeRawResults } from '../history/normalize/load.js'
import { createSystemInfo } from '../system/create/main.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const [rawResult, history] = await Promise.all([
    createRawResult(config),
    listHistory(config),
  ])
  const { targetResult, history: historyA } = normalizeRawResults(
    rawResult,
    history,
    config,
  )
  return { rawResult: targetResult, history: historyA }
}

const createRawResult = async function (config) {
  const combinations = await listCombinations(config)
  const { id, timestamp, systems } = await createSystemInfo(
    combinations,
    config,
  )
  return { id, timestamp, systems, combinations }
}
