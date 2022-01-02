import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { createSystemInfo } from '../system/create/main.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const combinations = await listCombinations(config)
  const previous = await listHistory(config)
  const { id, timestamp, systems } = await createSystemInfo(
    combinations,
    config,
  )
  const rawResult = { id, timestamp, systems, combinations }
  return { rawResult, previous }
}
