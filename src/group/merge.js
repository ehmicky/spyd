import { groupBy } from '../utils/group.js'
import { removeDuplicates } from '../iterations/duplicate.js'
import { mergeSystems } from '../system/merge.js'

// Merge previous benchmarks part of the same `group`.
// Later benchmarks have priority.
export const mergeBenchmarks = function(benchmarks) {
  return Object.values(groupBy(benchmarks, 'group')).map(mergeGroup)
}

const mergeGroup = function([benchmark, ...benchmarks]) {
  return benchmarks.reduce(mergePair, benchmark)
}

const mergePair = function(
  { systems: previousSystems, iterations: previousIterations },
  { id, systems: [system], iterations, ...benchmark },
) {
  const systems = mergeSystems(previousSystems, system)
  const iterationsA = removeDuplicates([...previousIterations, ...iterations])
  return { ...benchmark, id, systems, iterations: iterationsA }
}
