import { v4 as uuidv4 } from 'uuid'

import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { getSystems } from '../system/info.js'

// Create a new result to measure
export const createResult = async function (config) {
  const [{ combinations, systemVersions }, previous] = await Promise.all([
    getCombinations(config),
    listHistory(config),
  ])
  const result = initResult(combinations, systemVersions, config)
  return { result, previous }
}

const initResult = function (
  combinations,
  systemVersions,
  { envInfo, systemId },
) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ systemId, systemVersions, envInfo })
  return { id, timestamp, systems, combinations }
}
