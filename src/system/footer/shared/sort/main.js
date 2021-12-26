import { isTopPropGroup } from '../top.js'

import { sortDimensionsArray } from './dimensions.js'
import { addPropOrder, sortPropEntries, removePropOrder } from './props.js'
import { compareSystems } from './systems.js'

// Sort systems deeply so they are shown in a user-friendly and predictable way
// in the footer
export const sortSystems = function (systems) {
  // eslint-disable-next-line fp/no-mutating-methods
  return systems.map(addSortProps).sort(compareSystems).map(removeSortProps)
}

// Add properties used during sorting so they are only computed once
const addSortProps = function ({ dimensions: dimensionsArray, ...props }) {
  const isTopSystem = isTopPropGroup({ dimensionsArray })
  const propEntries = Object.entries(props).map(addPropOrder)
  const propEntriesA = sortPropEntries(propEntries)
  const dimensionsArrayA = sortDimensionsArray(
    dimensionsArray.map(Object.entries),
  )
  return {
    isTopSystem,
    propEntries: propEntriesA,
    dimensionsArray: dimensionsArrayA,
  }
}

const removeSortProps = function ({ propEntries, dimensionsArray }) {
  const props = Object.fromEntries(propEntries.map(removePropOrder))
  const dimensions = dimensionsArray.map(Object.fromEntries)
  return { dimensions, ...props }
}
