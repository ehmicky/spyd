import fastDeepEqual from 'fast-deep-equal'

import { groupBy } from '../utils/group.js'
import { removeDuplicates } from '../iterations/duplicate.js'

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

// Several benchmarks can have the same system, providing it is exactly the same
const mergeSystems = function(previousSystems, system) {
  const duplicateSystem = previousSystems.find(
    systemA => systemA.id === system.id,
  )

  if (duplicateSystem === undefined) {
    return [...previousSystems, system]
  }

  SAME_SYSTEM_PROPS.forEach(propName =>
    validateSystem(duplicateSystem, system, propName),
  )

  const previousSystemsA = previousSystems.filter(
    systemA => systemA.id !== system.id,
  )
  return [...previousSystemsA, system]
}

const SAME_SYSTEM_PROPS = ['opts']

const validateSystem = function(duplicateSystem, system, propName) {
  // TODO: replace with util.isDeepStrictEqual() once dropping support for
  // Node 8
  if (!fastDeepEqual(duplicateSystem[propName], system[propName])) {
    throw new Error(`Several benchmarks with the same "group" and "system" cannot have different ${propName}:
${JSON.stringify(duplicateSystem[propName])}
${JSON.stringify(system[propName])}`)
  }
}
