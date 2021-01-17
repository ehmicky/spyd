import omit from 'omit.js'

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

// The first `system` is a collection of all properties shared by other
// `systems`. Its `id`, `title` and `mean` are `undefined`.
const addSharedSystem = function (systems) {
  const sharedProps = getSharedProps(systems)
  const sharedSystem = getSharedSystem(sharedProps, systems)
  const systemsA = systems.map((system) => omit(system, sharedProps))
  return [sharedSystem, ...systemsA]
}

const getSharedProps = function ([firstSystem, ...nextSystems]) {
  return SHARED_PROPS.filter((propName) =>
    isSharedProp(firstSystem, nextSystems, propName),
  )
}

// Can optionally be the same across systems
const SHARED_PROPS = ['cpu', 'memory', 'os', 'jobNumber', 'jobUrl']

const isSharedProp = function (firstSystem, nextSystems, propName) {
  return nextSystems.every(
    (nextSystem) => nextSystem[propName] === firstSystem[propName],
  )
}

const getSharedSystem = function (sharedProps, [firstSystem]) {
  const props = sharedProps
    .filter(isOmitedSharedProp)
    .map((sharedProp) => [sharedProp, firstSystem[sharedProp]])
  return Object.fromEntries(props)
}

// Jobs are only shown when they differ between systems.
const isOmitedSharedProp = function (propName) {
  return !OMITTED_SHARED_PROPS.has(propName)
}

const OMITTED_SHARED_PROPS = new Set(['jobNumber', 'jobUrl'])
