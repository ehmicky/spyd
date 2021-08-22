// When merging results, we report all `systems`. This concatenates them.
// Systems with the same id are merged, with the most recent result having
// priority.
// `system` objects should not contain `undefined`, so we can directly merge.
// `git` and `machine` properties should not be deeply merged since their
// properties relate to each other. However, `versions` should.
export const mergeSystems = function (result, previousResult) {
  const previousSystemsA = previousResult.systems.map((previousSystem) =>
    mergeSystem(result.systems, previousSystem),
  )
  const previousSystemIds = new Set(previousSystemsA.map(getSystemId))
  const systemsA = result.systems.filter(({ id }) => !previousSystemIds.has(id))
  const systemsB = [...previousSystemsA, ...systemsA]
  return { ...result, systems: systemsB }
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
