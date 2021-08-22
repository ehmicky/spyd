import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { getSystemInfo } from '../system/info.js'

// Create a new result to measure
export const createResult = async function (config) {
  const [{ combinations, systemVersions }, previous] = await Promise.all([
    getCombinations(config),
    listHistory(config),
  ])
  const { id, timestamp, systems } = getSystemInfo(systemVersions, config)
  const result = { id, timestamp, systems, combinations }
  return { result, previous }
}
