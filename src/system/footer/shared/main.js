/* eslint-disable max-lines */
import { getPropGroups } from './group.js'
import { listPropEntries } from './list.js'
import { simplifyPropGroups } from './simplify.js'
import { sortSystems } from './sort.js'
import { addTopSystem } from './top.js'

// Split `systems` into several so that:
//  - Shared properties are shown under the same system titles
//  - As few systems as possible are shown
const addSharedSystems = function (systems) {
  const propEntries = listPropEntries(systems)
  const propGroups = getPropGroups(propEntries)
  const propGroupsA = simplifyPropGroups(propGroups, systems)
  const propGroupsB = addTopSystem(propGroupsA)
  const propGroupsC = sortSystems(propGroupsB)
  const systemsA = finalizeSystems(propGroupsC)
  systemsA.forEach(({ dimensions, ...props }) => {
    console.log(props, dimensions)
  })
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

const getSystemTitle = function (allDimensions) {
  return allDimensions
    .map((dimensions) =>
      Object.values(dimensions)
        .map((dimensionValues) =>
          dimensionValues.map(({ title }) => title).join('/'),
        )
        .join(' '),
    )
    .join(', ')
}

// TODO:
//  - debug the whole file, checking if each statement works
//  - this logic should come after `serialize.js`, i.e. there are no deep
//    properties and all properties values are strings
//     - However, the `system.title` logic should be moved after it
//  - fix `title` logic:
//     - transform each id string into { id: string, title: string }
//     - add `system.title`
//  - fix `PROP_ORDER` with real order (use one from `serialize.js`)
//     - dynamic properties should be sorted normally
//  - [SPYD_VERSION_NAME] should always be in shared system, using the latest
//    system's value
const SYSTEMS = [
  {
    dimensions: { os: 'linux', node_version: 'node_10', machine: 'one' },
    aa: 1,
    ff: 1,
    bb: 4,
    cc: 7,
    dd: 13,
    ee: true,
    gg: 20,
    hh: 7,
  },
  {
    dimensions: { os: 'macos', node_version: 'node_10', machine: 'one' },
    aa: 1,
    ff: 1,
    bb: 5,
    cc: 8,
    dd: 13,
    ee: true,
    gg: 20,
  },
  {
    dimensions: { os: 'windows', node_version: 'node_10', machine: 'one' },
    aa: 1,
    ff: 1,
    bb: 6,
    cc: 9,
    dd: 13,
    ee: true,
    gg: 30,
  },
  {
    dimensions: { os: 'linux', node_version: 'node_12', machine: 'two' },
    aa: 1,
    ff: 1,
    bb: 4,
    cc: 10,
    dd: 13,
    ee: true,
    gg: 20,
  },
  {
    dimensions: { os: 'macos', node_version: 'node_12', machine: 'one' },
    aa: 1,
    ff: 1,
    bb: 5,
    cc: 11,
    dd: 14,
    ee: true,
    gg: 20,
  },
  {
    dimensions: { os: 'windows', node_version: 'node_12', machine: 'one' },
    aa: 3,
    ff: 3,
    bb: 6,
    cc: 12,
    dd: 14,
    ee: true,
    gg: 30,
  },
  {
    dimensions: { os: 'linux', node_version: 'node_14', machine: 'two' },
    aa: 3,
    ff: 3,
    bb: 6,
    cc: 120,
    dd: 14,
    ee: true,
    gg: 30,
  },
  {
    dimensions: { os: 'macos', node_version: 'node_14', machine: 'two' },
    aa: 3,
    ff: 3,
    bb: 6,
    cc: 120,
    dd: 14,
    ee: true,
    gg: 30,
  },
  {
    dimensions: { os: 'windows', node_version: 'node_14', machine: 'one' },
    aa: 3,
    ff: 3,
    bb: 6,
    cc: 12,
    dd: 14,
    ee: true,
    gg: 30,
  },
]
addSharedSystems(SYSTEMS)
