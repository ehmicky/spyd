import { removeDuplicates } from '../combination/duplicate.js'
import { groupBy } from '../utils/group.js'

// Merge previous results.
// Later results have priority.
export const mergePartialResults = function (partialResults) {
  return Object.values(groupBy(partialResults, 'mergeId')).map(mergeResult)
}

export const mergePartialResult = function (results, partialResult) {}

const mergeResult = function ([partialResult, ...partialResults]) {
  return partialResults.reduce(mergePair, partialResult)
}

const mergePair = function (
  { systems: previousSystems, combinations: previousCombinations },
  { id, systems: [system], git, ci, combinations, ...result },
) {
  const systems = mergeSystems(previousSystems, system)
  const combinationsA = removeDuplicates([
    ...previousCombinations,
    ...combinations,
  ])
  return { ...result, id, systems, git, ci, combinations: combinationsA }
}

const mergeSystems = function (previousSystems, system) {
  const previousSystemsA = previousSystems.filter(
    (systemA) => systemA.id !== system.id,
  )
  return [...previousSystemsA, system]
}
