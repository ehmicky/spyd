import sortOn from 'sort-on'

import { isTopPropGroup } from './top.js'

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

// Sort the properties in each system, when it has several.
// Those follow a static order since the property names are known.
const sortPropEntries = function (propEntries) {
  const propEntriesA = propEntries.map(addPropOrder)
  return sortOn(propEntriesA, ['propOrder'])
}

const addPropOrder = function ({ propName, propValue }) {
  const propOrder = PROP_ORDER.indexOf(propName)
  return { propName, propValue, propOrder }
}

const removeSortProps = function ({ propEntries, dimensionsArray }) {
  const propEntriesA = propEntries.map(removePropOrder)
  const dimensionsArrayA = dimensionsArray.map(Object.fromEntries)
  return { propEntries: propEntriesA, dimensionsArray: dimensionsArrayA }
}

const removePropOrder = function ({ propName, propValue }) {
  return { propName, propValue }
}

const sortDimensionsArray = function (dimensionsArray) {
  // eslint-disable-next-line fp/no-mutating-methods
  return dimensionsArray.map(sortDimensions).sort(compareDimensionsEntries)
}

// Sort each dimension within a given `dimensions` by its dimension name
const sortDimensions = function (dimensions) {
  const dimensionsEntries = Object.entries(dimensions)
  return sortOn(dimensionsEntries, [0])
}

// Sort the `dimensions` in each system's title, when it has several:
//  - Sets with fewer `dimensions` are shown first
//  - Then, we compare the first dimension of each set by name, then value
//  - Then the second dimension, and so on
// eslint-disable-next-line complexity
const compareDimensionsEntries = function (
  dimensionsEntriesA,
  dimensionsEntriesB,
) {
  if (dimensionsEntriesA.length > dimensionsEntriesB.length) {
    return 1
  }

  if (dimensionsEntriesA.length < dimensionsEntriesB.length) {
    return -1
  }

  // eslint-disable-next-line unicorn/no-for-loop, fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < dimensionsEntriesA.length; index += 1) {
    const result = compareDimensionsEntry(
      dimensionsEntriesA[index],
      dimensionsEntriesB[index],
    )

    // eslint-disable-next-line max-depth
    if (result !== 0) {
      return result
    }
  }

  return 0
}

// eslint-disable-next-line complexity
const compareDimensionsEntry = function (
  [dimensionNameA, dimensionValueArrayA],
  [dimensionNameB, dimensionValueArrayB],
) {
  if (dimensionNameA > dimensionNameB) {
    return 1
  }

  if (dimensionNameA < dimensionNameB) {
    return -1
  }

  const maxLength = Math.max(
    dimensionValueArrayA.length,
    dimensionValueArrayB.length,
  )

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < maxLength; index += 1) {
    const result = compareDimensionsValue(
      dimensionValueArrayA[index],
      dimensionValueArrayB[index],
    )

    // eslint-disable-next-line max-depth
    if (result !== 0) {
      return result
    }
  }

  return 0
}

const compareDimensionsValue = function (dimensionValueA, dimensionValueB) {
  if (dimensionValueA < dimensionValueB) {
    return -1
  }

  if (dimensionValueA > dimensionValueB) {
    return 1
  }

  return 0
}

// Sort systems between each other:
//  - Top-level system first
//  - Then sorted to follow a specific order for the props
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
