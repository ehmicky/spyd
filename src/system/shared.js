import filterObj from 'filter-obj'
import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { cleanObject } from '../utils/clean.js'

// `systems[0]` is a collection of all properties shared by other `systems`.
// Its `id` and `title` are `undefined`.
// This helps avoid duplication when reporting similar systems.
export const splitSharedSystem = function (systems) {
  const [firstSystem, ...otherSystems] = systems
  const sharedSystem = getSharedSystem(firstSystem, otherSystems)
  const systemsA = systems.map((system) =>
    removeSharedSystem(system, sharedSystem),
  )
  return [sharedSystem, ...systemsA]
}

const getSharedSystem = function (firstSystem, systems) {
  const sharedSystem = filterObj(firstSystem, (key, value) =>
    isSharedProp(key, value, systems),
  )
  const sharedSystemA = mapObj(sharedSystem, (key, value) => [
    key,
    getSharedSystemProp(key, value, systems),
  ])
  return cleanObject(sharedSystemA)
}

const isSharedProp = function (key, value, systems) {
  return (
    !NOT_SHARED_PROPS.has(key) &&
    (isPlainObj(value) || systems.every((system) => system[key] === value))
  )
}

// Some properties might possibly be common, but should not be shared since
// they identify systems.
const NOT_SHARED_PROPS = new Set(['id', 'title'])

const getSharedSystemProp = function (key, value, systems) {
  if (!isPlainObj(value)) {
    return value
  }

  const systemProps = systems.map((system) => system[key])
  return getSharedSystem(value, systemProps)
}

const removeSharedSystem = function (system, sharedSystem = {}) {
  const systemA = filterObj(system, (key, value) => value !== sharedSystem[key])
  const systemB = mapObj(systemA, (key, value) => [
    key,
    removeSharedSystemProp(key, value, sharedSystem),
  ])
  return cleanObject(systemB)
}

const removeSharedSystemProp = function (key, value, sharedSystem) {
  if (!isPlainObj(value)) {
    return value
  }

  return removeSharedSystem(value, sharedSystem[key])
}
