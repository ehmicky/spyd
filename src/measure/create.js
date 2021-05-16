import { v4 as uuidv4 } from 'uuid'

import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { getSystems } from '../system/info.js'

// Create a new result to measure
export const createResult = async function (config) {
  const { combinations, systemVersions } = await getCombinations(config)
  const result = initResult(combinations, systemVersions, config)
  const resultA = await listHistory(config, result)
  const newCombinations = resultA.combinations.filter(isNewCombination)
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
  const combinationsA = combinations.map(addCombinationIndex)
  return { id, timestamp, systems, combinations: combinationsA }
}

const addCombinationIndex = function (combination, index) {
  return { ...combination, index }
}

// Retrieve combinations being measured, as opposed to the ones merged to the
// result due to the `since` configuration property
const isNewCombination = function ({ resultId }) {
  return resultId === undefined
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
