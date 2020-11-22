import omit from 'omit.js'

// We join two collection of similar `systems`:
//  - after joining with previous benchmarks of same mergeId, to retrieve their
//    options and systems
//  - after merging combinations, to retrieve their speed and set
//    combination.rank
export const joinSystems = function (systems, systemColls) {
  const systemsA = systemColls.map((systemColl) =>
    mergeSystem(systems, systemColl),
  )
  const systemsB = addSharedSystem(systemsA)
  return systemsB
}

const mergeSystem = function (systems, systemColl) {
  const system = systems.find((systemA) => systemA.id === systemColl.id)
  return { ...systemColl, ...system }
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
  const sharedProps = SHARED_PROPS.filter((propName) =>
    isSharedProp(firstSystem, nextSystems, propName),
  )
  return [...SAME_PROPS, ...sharedProps]
}

// Can optionally be the same across systems
const SHARED_PROPS = ['cpu', 'memory', 'os', 'jobNumber', 'jobUrl']
// Validated to always be the same across systems, so it's always shared.
const SAME_PROPS = ['opts']

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
