import fastDeepEqual from 'fast-deep-equal'

// Several benchmarks can have the same system, providing it is exactly the same
export const mergeSystems = function(previousSystems, system) {
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
