import { isTopPropGroup } from '../top.js'

import { sortDimensionsArray } from './dimensions.js'
import { sortPropEntries } from './props.js'
import { compareSystems } from './systems.js'

// Sort systems deeply so they are shown in a user-friendly and predictable way
// in the footer
export const sortSystems = function (propGroups) {
  // eslint-disable-next-line fp/no-mutating-methods
  return propGroups.map(addSortProps).sort(compareSystems).map(removeSortProps)
}

// Add properties used during sorting so they are only computed once
const addSortProps = function ({ propEntries, dimensionsArray }) {
  const isTopSystem = isTopPropGroup({ dimensionsArray })
  const propEntriesA = sortPropEntries(propEntries)
  const dimensionsArrayA = sortDimensionsArray(dimensionsArray)
  return {
    isTopSystem,
    propEntries: propEntriesA,
    dimensionsArray: dimensionsArrayA,
  }
}

const removeSortProps = function ({ propEntries, dimensionsArray }) {
  const propEntriesA = propEntries.map(removePropOrder)
  const dimensionsArrayA = dimensionsArray.map(Object.fromEntries)
  return { propEntries: propEntriesA, dimensionsArray: dimensionsArrayA }
}

const removePropOrder = function ({ propName, propValue }) {
  return { propName, propValue }
}
