import { sortDimensionsArray } from './dimensions.js'
import { addPropOrder, removePropOrder, sortPropEntries } from './props.js'
import { compareSystems } from './systems.js'

// Sort systems deeply so they are shown in a user-friendly and predictable way
// in the footer
export const sortSystems = (footer) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const systems = footer.systems
    .map(addSortProps)
    .sort(compareSystems)
    .map(removeSortProps)
  return { ...footer, systems }
}

// Add properties used during sorting so they are only computed once
const addSortProps = ({ dimensions: dimensionsArray, props }) => {
  const isTopSystem = dimensionsArray.length === 0
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

const removeSortProps = ({ propEntries, dimensionsArray }) => {
  const props = Object.fromEntries(propEntries.map(removePropOrder))
  const dimensions = dimensionsArray.map(Object.fromEntries)
  return { dimensions, props }
}
