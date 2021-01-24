import filterObj from 'filter-obj'
import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { cleanObject } from '../utils/clean.js'

import { SPYD_VERSION_KEY } from './versions.js'

// `systems[0]` is a collection of all properties shared by other `systems`.
// Its `id` is `undefined`.
// This helps avoid duplication when reporting similar systems.
export const splitSharedSystem = function ({ systems, ...result }) {
  const [firstSystem, ...otherSystems] = systems
  const sharedSystem = getSharedSystem(firstSystem, otherSystems)
  const systemsA = systems.map((system) =>
    removeSharedSystem(system, sharedSystem),
  )
  const systemsB = [sharedSystem, ...systemsA]
  return { ...result, systems: systemsB }
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
    ALWAYS_SHARED_PROPS.has(key) ||
    (!NEVER_SHARED_PROPS.has(key) &&
      (isPlainObj(value) || systems.every((system) => system[key] === value)))
  )
}

// Some properties are never system-specific, i.e. we only keep the latest
const ALWAYS_SHARED_PROPS = new Set([SPYD_VERSION_KEY])
// Some properties might possibly be common, but should not be shared since
// they identify systems.
const NEVER_SHARED_PROPS = new Set(['id'])

const getSharedSystemProp = function (key, value, systems) {
  if (!isPlainObj(value)) {
    return value
  }

  const systemProps = systems.map((system) => system[key])
  return getSharedSystem(value, systemProps)
}

const removeSharedSystem = function (system, sharedSystem = {}) {
  const systemA = filterObj(
    system,
    (key, value) =>
      !ALWAYS_SHARED_PROPS.has(key) && value !== sharedSystem[key],
  )
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
