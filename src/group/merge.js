import { groupBy } from '../utils/group.js'
import { removeDuplicates } from '../iterations/duplicate.js'

import { validateMerge } from './validate.js'

// Merge previous benchmarks part of the same `group`.
// Later benchmarks have priority.
export const mergeBenchmarks = function (benchmarks) {
  return Object.values(groupBy(benchmarks, 'group')).map(mergeGroup)
}

const mergeGroup = function ([benchmark, ...benchmarks]) {
  return benchmarks.reduce(mergePair, benchmark)
}

const mergePair = function (
  {
    systems: previousSystems,
    git: previousGit,
    ci: previousCi,
    iterations: previousIterations,
  },
  { id, systems: [system], git, ci, iterations, ...benchmark },
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
  const iterationsA = removeDuplicates([...previousIterations, ...iterations])
  return { ...benchmark, id, systems, git, ci, iterations: iterationsA }
}

const mergeSystems = function (previousSystems, system) {
  const previousSystemsA = previousSystems.filter(
    (systemA) => systemA.id !== system.id,
  )
  return [...previousSystemsA, system]
}
