// When merging results, we report all `systems`. This concatenates them.
export const normalizeResultSystems = function ({ system, ...result }) {
  return { ...result, systems: [system] }
}

// Systems with the same id are merged, with the most recent result having
// priority.
// `system` objects should not contain `undefined`, so we can directly merge.
// `git` and `machine` properties should not be deeply merged since their
// properties relate to each other. However, `versions` should.
export const mergeSystems = function (systems, { id, ...newSystem }) {
  const systemA = systems.find((system) => system.id === id)

  if (systemA === undefined) {
    return [...systems, { ...newSystem, id }]
  }

  const systemsA = systems.filter((systemB) => systemB.id !== id)
  return [
    ...systemsA,
    {
      ...newSystem,
      ...systemA,
      versions: { ...newSystem.versions, ...systemA.versions },
    },
  ]
}
