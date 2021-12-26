import sortOn from 'sort-on'

import { isTopPropGroup } from './top.js'

// Sort `propGroups` so that systems are shown in a good order in the footer:
//  - Top-level system first
//  - Then sorted to follow a specific order for the props
//  - If a prop has several values, the values are sorted too
// We sort all of:
//  - The systems
//  - The dimensions in each system's title
//  - The properties in each system
export const sortSystems = function (propGroups) {
  // eslint-disable-next-line fp/no-mutating-methods
  return propGroups.map(addSortProps).sort(compareSystems)
}

// Add properties used during sorting so they are only computed once
const addSortProps = function ({ propEntries, dimensionsArray }) {
  const isTopSystem = isTopPropGroup({ dimensionsArray })
  const propEntriesA = propEntries.map(addPropOrder)
  const propEntriesB = sortOn(propEntriesA, ['propOrder'])
  return { isTopSystem, propEntries: propEntriesB, dimensionsArray }
}

const addPropOrder = function ({ propName, propValue }) {
  const propOrder = PROP_ORDER.indexOf(propName)
  return { propName, propValue, propOrder }
}

// eslint-disable-next-line complexity
const compareSystems = function (
  { isTopSystem: isTopSystemA, propEntries: propEntriesA },
  { isTopSystem: isTopSystemB, propEntries: propEntriesB },
) {
  if (isTopSystemA) {
    return -1
  }

  if (isTopSystemB) {
    return 1
  }

  // eslint-disable-next-line unicorn/no-for-loop, fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < propEntriesA.length; index += 1) {
    const result = comparePropEntries(propEntriesA[index], propEntriesB[index])

    // eslint-disable-next-line max-depth
    if (result !== 0) {
      return result
    }
  }

  return 0
}

// eslint-disable-next-line complexity, max-statements
const comparePropEntries = function (propEntryA, propEntryB) {
  if (propEntryB === undefined) {
    return 1
  }

  if (propEntryA.propOrder > propEntryB.propOrder) {
    return 1
  }

  if (propEntryA.propOrder < propEntryB.propOrder) {
    return -1
  }

  if (propEntryA.propValue > propEntryB.propValue) {
    return 1
  }

  if (propEntryA.propValue < propEntryB.propValue) {
    return -1
  }

  return 0
}

// Order where each property should be shown in the footer
const PROP_ORDER = ['aa', 'ff', 'bb', 'cc', 'dd', 'ee', 'gg', 'hh']
