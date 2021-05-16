import { v4 as uuidv4 } from 'uuid'

import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { getSystems } from '../system/info.js'

// Create a new result to measure
export const createResult = async function (config) {
  const { combinations, systemVersions } = await getCombinations(config)
  const initResult = initializeResult(config, combinations, systemVersions)
  const initResultA = await listHistory(config, initResult)
  const newCombinations = getNewCombinations(initResultA)
  return { initResult: initResultA, newCombinations }
}

const initializeResult = function (
  { envInfo, systemId },
  combinations,
  systemVersions,
) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ systemId, systemVersions, envInfo })
  const combinationsA = combinations.map((combination, index) => ({
    ...combination,
    resultId: id,
    index,
  }))
  return { id, timestamp, systems, combinations: combinationsA }
}

// Retrieve combinations being measured, as opposed to the ones merged to the
// result due to the `since` configuration property
const getNewCombinations = function ({ combinations, id }) {
  return combinations.filter(({ resultId }) => resultId === id)
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
