import { removeDuplicates } from '../combination/duplicate.js'
import { groupBy } from '../utils/group.js'

import { validateMerge } from './validate.js'

// Merge previous benchmarks part of the same `mergeId`.
// Later benchmarks have priority.
export const mergeRawBenchmarks = function (rawBenchmarks) {
  return Object.values(groupBy(rawBenchmarks, 'mergeId')).map(mergeBenchmark)
}

const mergeBenchmark = function ([rawBenchmark, ...rawBenchmarks]) {
  return rawBenchmarks.reduce(mergePair, rawBenchmark)
}

const mergePair = function (
  {
    systems: previousSystems,
    git: previousGit,
    ci: previousCi,
    combinations: previousCombinations,
  },
  { id, systems: [system], git, ci, combinations, ...benchmark },
) {
  validateMerge({
    previousSystems,
    system,
    previousGit,
    git,
    previousCi,
    ci,
  })

  const systems = mergeSystems(previousSystems, system)
  const combinationsA = removeDuplicates([
    ...previousCombinations,
    ...combinations,
  ])
  return { ...benchmark, id, systems, git, ci, combinations: combinationsA }
}

const mergeSystems = function (previousSystems, system) {
  const previousSystemsA = previousSystems.filter(
    (systemA) => systemA.id !== system.id,
  )
  return [...previousSystemsA, system]
}
