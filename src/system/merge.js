// When merging results, we report all `systems`. This concatenates them.
// Systems with the same id are merged, with the most recent result having
// priority.
// Order matters: we show more recent systems first, i.e. they must be first
// in the array.
// `system` objects should not contain `undefined`, so we can directly merge.
// `git` and `machine` properties should not be deeply merged since their
// properties relate to each other. However, `versions` should.
export const normalizeSystems = function ({ system, ...result }) {
  return { ...result, systems: [system] }
}

export const mergeSystems = function (result, previousResult) {
  const systems = appendSystem(result, previousResult)
  return { ...result, systems }
}

const appendSystem = function ({ systems }, { system: previousSystem }) {
  return systems.some(({ id }) => id === previousSystem.id)
    ? systems.map((system) => mergePreviousSystem(system, previousSystem))
    : [...systems, previousSystem]
}

const mergePreviousSystem = function (system, previousSystem) {
  if (system.id !== previousSystem.id) {
    return system
  }

  return {
    ...previousSystem,
    ...system,
    versions: { ...previousSystem.versions, ...system.versions },
  }
}
