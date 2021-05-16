import { v4 as uuidv4 } from 'uuid'

import { getSystems } from '../system/info.js'

// Add metadata information to initial result
export const createResult = function ({
  combinations,
  systemVersions,
  config: { envInfo, systemId },
}) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ systemId, systemVersions, envInfo })
  const combinationsA = combinations.map((combination) => ({
    ...combination,
    resultId: id,
  }))
  return { id, timestamp, systems, combinations: combinationsA, history: [] }
}

// Add measured combinations at the end of the result
export const addCombinations = function (initResult, newCombinations) {
  return newCombinations.reduce(addCombination, initResult)
}

const addCombination = function (initResult, newCombination) {
  const combinations = [
    ...initResult.combinations.slice(0, newCombination.index),
    newCombination,
    ...initResult.combinations.slice(newCombination.index + 1),
  ]
  return { ...initResult, combinations }
}
