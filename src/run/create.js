import { listCombinations } from '../combination/list/main.js'
import { listHistory } from '../history/data/main.js'
import { createSystemInfo } from '../system/create/main.js'

// Create a new result to measure
export const createResult = async function (config) {
  const [combinations, previous] = await Promise.all([
    listCombinations(config),
    listHistory(config),
  ])
  const { id, timestamp, system } = await createSystemInfo(combinations, config)
  const result = { id, timestamp, system, combinations }
  return { result, previous }
}
