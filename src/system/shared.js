import omit from 'omit.js'

// The first `system` is a collection of all properties shared by other
// `systems`. Its `id`, `title` and `mean` are `undefined`.
export const addSharedSystem = function (systems) {
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
