// System merging is only needed at the beginning of reporting, after `since`
// has been applied. It does not need to be repeated later.
export const mergeResultsSystems = function (result, previousResult) {
  if (result.systems === undefined) {
    return result
  }

  const systems = mergeSystems(result.systems, previousResult.systems)
  return { ...result, systems }
}

// When merging results, we report all `systems`. This concatenates them.
// Systems with the same id are merged, with the most recent result having
// priority.
// `system` objects should not contain `undefined`, so we can directly merge.
// `git` and `machine` properties should not be deeply merged since their
// properties relate to each other. However, `versions` should.
const mergeSystems = function (systems, previousSystems) {
  const previousSystemsA = previousSystems.map((previousSystem) =>
    mergeSystem(systems, previousSystem),
  )
  const previousSystemIds = new Set(previousSystemsA.map(getSystemId))
  const systemsA = systems.filter(({ id }) => !previousSystemIds.has(id))
  return [...previousSystemsA, ...systemsA]
}

const mergeSystem = function (systems, previousSystem) {
  const system = systems.find(({ id }) => id === previousSystem.id)
  return system === undefined
    ? previousSystem
    : {
        ...previousSystem,
        ...system,
        versions: { ...previousSystem.versions, ...system.versions },
      }
}

const getSystemId = function ({ id }) {
  return id
}
