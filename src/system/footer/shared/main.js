import { getPropGroups } from './group.js'
import { listPropEntries } from './list.js'
import { simplifyPropGroups } from './simplify.js'
import { addTopSystem } from './top.js'

// Split `systems` into several so that:
//  - Shared properties are shown under the same system titles
//  - As few systems as possible are shown
export const addSharedSystems = function (systems) {
  const propEntries = listPropEntries(systems)
  const propGroups = getPropGroups(propEntries)
  const propGroupsA = simplifyPropGroups(propGroups, systems)
  const propGroupsB = addTopSystem(propGroupsA)
  const systemsA = finalizeSystems(propGroupsB)
  return systemsA
}

// Transform `propGroups` back to `systems`
const finalizeSystems = function (propGroups) {
  return propGroups.map(finalizeSystem)
}

const finalizeSystem = function ({ propEntries, dimensionsArray }) {
  const props = Object.fromEntries(propEntries.map(getPropEntry))
  return { dimensions: dimensionsArray, ...props }
}

const getPropEntry = function ({ propName, propValue }) {
  return [propName, propValue]
}
