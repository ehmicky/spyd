import { removeDuplicates } from '../combination/duplicate.js'

// Merge previous results to the last result
export const mergeResults = function (results) {
  return results
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
