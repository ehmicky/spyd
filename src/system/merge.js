import omit from 'omit.js'

// When merging results, we report all `systems`. This concatenates them.
export const startMergeSystems = function ({ system, ...result }) {
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

// The first `system` is a collection of all properties shared by other
// `systems`. Its `id` and `title` are `undefined`.
// This helps avoid duplication when reporting similar systems.
export const endMergeSystems = function ({ systems, ...result }) {
  const sharedProps = getSharedProps(systems)
  const sharedSystem = getSharedSystem(sharedProps, systems)
  const systemsA = systems.map((system) => omit(system, sharedProps))
  return { ...result, systems: [sharedSystem, ...systemsA] }
}

const getSharedProps = function ([firstSystem, ...nextSystems]) {
  return SHARED_PROPS.filter((propName) =>
    isSharedProp(firstSystem, nextSystems, propName),
  )
}

// Can optionally be the same across systems
const SHARED_PROPS = ['cpu', 'memory', 'os']

const isSharedProp = function (firstSystem, nextSystems, propName) {
  return nextSystems.every(
    (nextSystem) => nextSystem[propName] === firstSystem[propName],
  )
}

const getSharedSystem = function (sharedProps, [firstSystem]) {
  const props = sharedProps.map((sharedProp) => [
    sharedProp,
    firstSystem[sharedProp],
  ])
  return Object.fromEntries(props)
}
