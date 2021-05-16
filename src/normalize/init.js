import { v4 as uuidv4 } from 'uuid'

import { isSameCategory } from '../combination/ids.js'
import { getSystems } from '../system/info.js'

import { normalizeResult } from './result.js'

// Add metadata information to initial result
export const getInitResult = function ({
  combinations,
  combinations: [{ systemId }],
  systemVersions,
  config: { envInfo },
}) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ systemId, systemVersions, envInfo })
  const combinationsA = combinations.map(addEmptyStats)
  return { id, timestamp, systems, combinations: combinationsA, history: [] }
}

const addEmptyStats = function (combination) {
  return { ...combination, stats: {} }
}

// Finalize result. Done either at the end, or before each preview.
export const getFinalResult = function (initResult, newCombinations) {
  const rawResult = addCombinations(initResult, newCombinations)
  const result = normalizeResult(rawResult)
  return { rawResult, result }
}

const addCombinations = function (initResult, newCombinations) {
  const combinations = initResult.combinations
    .map((combination) => addCombination(newCombinations, combination))
    .map(getFinalCombination)
  return { ...initResult, combinations }
}

const addCombination = function (combinations, newCombination) {
  const combinationA = combinations.find((combination) =>
    isSameCategory(combination, newCombination),
  )
  return combinationA === undefined ? newCombination : combinationA
}

// Retrieve final combination properties used for reporting.
const getFinalCombination = function ({ taskId, runnerId, systemId, stats }) {
  return { taskId, runnerId, systemId, stats }
}
