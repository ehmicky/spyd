import { getPropGroups } from './group.js'
import { listPropEntries } from './list.js'
import { simplifyPropGroups } from './simplify.js'
import { addTopSystem } from './top.js'

// Split `systems` into several so that:
//  - Shared properties are shown under the same system titles
//  - As few systems as possible are shown
// The logic relies on all system properties values being strings, which is
// done by the serialization logic previously applied.
export const addSharedSystems = (footer) => {
  const propEntries = listPropEntries(footer.systems)
  const propGroups = getPropGroups(propEntries)
  const propGroupsA = simplifyPropGroups(propGroups, footer.systems)
  const propGroupsB = addTopSystem(propGroupsA)
  const systems = finalizeSystems(propGroupsB)
  return { ...footer, systems }
}

// Transform `propGroups` back to `systems`
const finalizeSystems = (propGroups) => propGroups.map(finalizeSystem)

const finalizeSystem = ({ propEntries, dimensionsArray }) => {
  const props = Object.fromEntries(propEntries.map(getPropEntry))
  return { dimensions: dimensionsArray, props }
}

const getPropEntry = ({ propName, propValue }) => [propName, propValue]
