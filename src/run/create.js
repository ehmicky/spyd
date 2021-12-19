import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { createSystemInfo } from '../system/create/main.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const [combinations, previous] = await Promise.all([
    listCombinations(config),
    listHistory(config),
  ])
  const { id, timestamp, system } = await createSystemInfo(combinations, config)
  const rawResult = { id, timestamp, system, combinations }
  return { rawResult, previous }
}
