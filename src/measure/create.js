import { v4 as uuidv4 } from 'uuid'

import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { getSystems } from '../system/info.js'

// Create a new result to measure
export const createResult = async function (config) {
  const { combinations, systemVersions } = await getCombinations(config)
  const result = initResult(combinations, systemVersions, config)
  const resultA = await listHistory(config, result)
  const newCombinations = combinations.map(addCombinationIndex)
  return { result: resultA, newCombinations }
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

const addCombinationIndex = function (combination, index) {
  return { ...combination, index }
}

// Add measured combinations at the end of the result
export const addCombinations = function (result, newCombinations) {
  return newCombinations.reduce(addCombination, result)
}

const addCombination = function (result, newCombination) {
  const combinations = [
    ...result.combinations.slice(0, newCombination.index),
    newCombination,
    ...result.combinations.slice(newCombination.index + 1),
  ]
  return { ...result, combinations }
}
