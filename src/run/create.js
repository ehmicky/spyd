import { listCombinations } from '../combination/list.js'
import { listHistoryForRun } from '../history/data/main.js'
import { createSystemInfo } from '../system/create/main.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const [history, combinations] = await Promise.all([
    listHistoryForRun(config),
    listCombinations(config),
  ])
  const { id, timestamp, systems } = await createSystemInfo(
    combinations,
    config,
  )
  const rawResult = { id, timestamp, systems, combinations }
  return { rawResult, history }
}
