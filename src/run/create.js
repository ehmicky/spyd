import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { createSystemInfo } from '../system/create.js'

// Create a new result to measure
export const createResult = async function (config) {
  const [combinations, previous] = await Promise.all([
    getCombinations(config),
    listHistory(config),
  ])
  const { id, timestamp, system } = await createSystemInfo(combinations, config)
  const result = { id, timestamp, system, combinations }
  return { result, previous }
}
