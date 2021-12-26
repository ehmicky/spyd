/* eslint-disable max-lines */
import mapObj from 'map-obj'
import omit from 'omit.js'
import sortOn from 'sort-on'

import { isSameArray } from '../../../utils/equal.js'
import { findIndexFrom } from '../../../utils/find.js'
import { setArray } from '../../../utils/set.js'
import { uniqueDeep, uniqueDeepUnordered } from '../../../utils/unique.js'

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

// List all `propEntries`, i.e. unique sets of system props names + values.
const listPropEntries = function (systems) {
  const normalizedSystems = systems.map(separateSystemProps)
  const propNames = getUniquePropNames(normalizedSystems)
  const propEntries = getUniquePropEntries(propNames, normalizedSystems)
  const propEntriesA = propEntries.map((propEntry) =>
    addPropEntryDimensions(propEntry, normalizedSystems),
  )
  return propEntriesA
}

const separateSystemProps = function ({ dimensions, ...props }) {
  return { dimensions, props }
}

// List all unique system props names
const getUniquePropNames = function (systems) {
  return [...new Set(systems.flatMap(getPropNames))]
}

const getPropNames = function ({ props }) {
  return Object.keys(props)
}

// List all unique system props names + values
const getUniquePropEntries = function (propNames, systems) {
  return propNames.flatMap((propName) => getUniquePropEntry(propName, systems))
}

const getUniquePropEntry = function (propName, systems) {
  const propValues = [...new Set(systems.map(({ props }) => props[propName]))]
  return propValues.map((propValue) => ({ propName, propValue }))
}

// For each `propEntry`, add the list of matching dimensions
const addPropEntryDimensions = function ({ propName, propValue }, systems) {
  const dimensionsArray = systems
    .filter(({ props }) => props[propName] === propValue)
    .map(({ dimensions }) => dimensions)
  return { propName, propValue, dimensionsArray }
}

// Group `propEntries` together if they share the same `dimensionsArray`.
// Like this, system properties applying to the same dimensions are shown
// together.
const getPropGroups = function (propEntries) {
  const dimensionsArrays = uniqueDeepUnordered(
    propEntries.map(getPropEntryDimensions),
  )
  const propGroups = dimensionsArrays.map((dimensionsArray) =>
    getPropGroup(dimensionsArray, propEntries),
  )
  return propGroups
}

const getPropEntryDimensions = function ({ dimensionsArray }) {
  return dimensionsArray
}

const getPropGroup = function (dimensionsArray, propEntries) {
  const propEntriesA = propEntries
    .filter(({ dimensionsArray: dimensionsArrayB }) =>
      isSameArray(dimensionsArray, dimensionsArrayB),
    )
    .map(removeDimensionsArray)
  return { propEntries: propEntriesA, dimensionsArray }
}

const removeDimensionsArray = function ({ propName, propValue }) {
  return { propName, propValue }
}

// Reduce the amount of system dimensions and properties so the system footer
// looks simpler
const simplifyPropGroups = function (propGroups, systems) {
  return propGroups.map((propGroup) => simplifyPropGroup(propGroup, systems))
}

const simplifyPropGroup = function ({ propEntries, dimensionsArray }, systems) {
  const dimensionsArrayA = skipRedundantInfo(dimensionsArray, systems)
  const dimensionsArrayB = uniqueDeep(dimensionsArrayA)
  const dimensionsArrayC = normalizeTopSystem(dimensionsArrayB)
  const dimensionsArrayD = concatDimensionsValues(dimensionsArrayC)
  return { propEntries, dimensionsArray: dimensionsArrayD }
}

// Some dimensions are redundant, i.e. removing them does change which systems
// are matched because either:
//  - The prop is matched by several dimensions in `dimensionsArray`
//  - The systems are missing some dimensions
// For example, if a prop applies to all systems, its `dimensionsArray` will
// list each possible `dimensions`. This logic would reduce it to an empty
// `dimensionArray`.
// We do this by iterating through each dimension, checking if it can be
// removed, then removing it.
const skipRedundantInfo = function (dimensionsArray, systems) {
  return dimensionsArray.reduce(
    skipRedundantDimensions.bind(undefined, systems),
    dimensionsArray,
  )
}

// Sometimes, removing dimensions can result in several equivalent but different
// result depending on the order in which dimensions are iterated.
//  - We iterate from the last to the first dimensions, so that the last
//    dimensions are removed instead of the first ones, since the first ones
//    are more likely to be more significant for users.
// eslint-disable-next-line max-params
const skipRedundantDimensions = function (
  systems,
  dimensionsArray,
  dimensions,
  index,
) {
  return Object.keys(dimensions).reduceRight(
    skipRedundantDimension.bind(undefined, { systems, index }),
    dimensionsArray,
  )
}

const skipRedundantDimension = function (
  { systems, index },
  dimensionsArray,
  dimensionName,
) {
  if (
    !isRedundantDimension({ systems, dimensionsArray, dimensionName, index })
  ) {
    return dimensionsArray
  }

  const dimensions = dimensionsArray[index]
  const dimensionsA = omit.default(dimensions, [dimensionName])
  return setArray(dimensionsArray, index, dimensionsA)
}

// Check if removing the dimension would result in a different count of matching
// systems
const isRedundantDimension = function ({
  systems,
  dimensionsArray,
  dimensionName,
  index,
}) {
  const { length } = systems.filter((system) =>
    dimensionsArrayMatches({ system, dimensionsArray, index, dimensionName }),
  )
  return length === dimensionsArray.length
}

const dimensionsArrayMatches = function ({
  system,
  dimensionsArray,
  index,
  dimensionName,
}) {
  return dimensionsArray.some((dimensions, indexB) =>
    dimensionsMatches({
      system,
      dimensions,
      index,
      indexB,
      dimensionName,
    }),
  )
}

const dimensionsMatches = function ({
  system,
  dimensions,
  index,
  indexB,
  dimensionName,
}) {
  return Object.entries(dimensions).every(([dimensionNameB, dimensionValueB]) =>
    dimensionMatches({
      system,
      index,
      indexB,
      dimensionName,
      dimensionNameB,
      dimensionValueB,
    }),
  )
}

const dimensionMatches = function ({
  system,
  index,
  indexB,
  dimensionName,
  dimensionNameB,
  dimensionValueB,
}) {
  return (
    system.dimensions[dimensionNameB] === dimensionValueB ||
    (indexB === index && dimensionNameB === dimensionName)
  )
}

// Properties which apply to all systems result in a `dimensionsArray` with a
// single empty object. We normalize it to an empty array.
const normalizeTopSystem = function (dimensionsArray) {
  return dimensionsArray.filter(isNotEmptyDimensions)
}

const isNotEmptyDimensions = function (dimensions) {
  return Object.keys(dimensions).length !== 0
}

// A system prop might match two sets of dimensions identical except for one
// dimension. In that case, we merge both.
//  - For example, if a system prop applies to A+Red, B+Green, A+Green, B+Red,
//    we simplify it to A/B+Red/Green
// We do so by iterating through every combination of dimensions
//  - If only one dimension differs, we merge them
//  - We repeat until no more dimension has been merged
const concatDimensionsValues = function (dimensionsArray) {
  const dimensionsArrayA = dimensionsArray.map(normalizeDimensions)

  // eslint-disable-next-line fp/no-let
  let dimensionsCount = 0

  // eslint-disable-next-line fp/no-loops
  while (dimensionsCount !== dimensionsArrayA.length) {
    // eslint-disable-next-line fp/no-mutation
    dimensionsCount = dimensionsArrayA.length
    loopFirstDimensions(dimensionsArrayA)
  }

  const dimensionsArrayB = dimensionsArrayA.map(denormalizeDimensions)
  return dimensionsArrayB
}

const normalizeDimensions = function (dimensions) {
  const dimensionNames = Object.keys(dimensions)
  const dimensionsA = mapObj(dimensions, normalizeDimension)
  return { dimensionNames, dimensions: dimensionsA }
}

// Dimension values are now array of alternatives
const normalizeDimension = function (dimensionName, dimensionValue) {
  return [dimensionName, [dimensionValue]]
}

const denormalizeDimensions = function ({ dimensions }) {
  return dimensions
}

const loopFirstDimensions = function (dimensionsArray) {
  // eslint-disable-next-line fp/no-loops
  for (
    // eslint-disable-next-line fp/no-let
    let firstIndex = 0;
    firstIndex < dimensionsArray.length - 1;
    // eslint-disable-next-line fp/no-mutation
    firstIndex += 1
  ) {
    const { dimensions: firstDimensions, dimensionNames } =
      dimensionsArray[firstIndex]
    loopSecondDimensions(
      dimensionsArray,
      firstIndex,
      firstDimensions,
      dimensionNames,
    )
  }
}

// eslint-disable-next-line max-params
const loopSecondDimensions = function (
  dimensionsArray,
  firstIndex,
  firstDimensions,
  dimensionNames,
) {
  // eslint-disable-next-line fp/no-loops
  for (
    // eslint-disable-next-line fp/no-let
    let secondIndex = firstIndex + 1;
    secondIndex < dimensionsArray.length;
    // eslint-disable-next-line fp/no-mutation
    secondIndex += 1
  ) {
    const {
      dimensions: secondDimensions,
      dimensionNames: secondDimensionNames,
    } = dimensionsArray[secondIndex]
    const concatDimensionName = findConcatDimension(
      firstDimensions,
      dimensionNames,
      secondDimensions,
      secondDimensionNames,
    )

    // eslint-disable-next-line max-depth
    if (concatDimensionName !== undefined) {
      // eslint-disable-next-line fp/no-mutation
      secondIndex = concatValues(
        dimensionsArray,
        firstDimensions,
        secondDimensions,
        concatDimensionName,
        secondIndex,
      )
    }
  }
}

// Find another `dimensions` with the same names and exactly 1 different value.
// eslint-disable-next-line max-params
const findConcatDimension = function (
  firstDimensions,
  dimensionNames,
  secondDimensions,
  secondDimensionNames,
) {
  if (!isSameArray(dimensionNames, secondDimensionNames)) {
    return
  }

  const differentDimensionIndexA = findDifferentDimension(
    dimensionNames,
    firstDimensions,
    secondDimensions,
    0,
  )

  if (differentDimensionIndexA === -1) {
    return
  }

  const differentDimensionIndexB = findDifferentDimension(
    dimensionNames,
    firstDimensions,
    secondDimensions,
    differentDimensionIndexA + 1,
  )

  if (differentDimensionIndexB !== -1) {
    return
  }

  return dimensionNames[differentDimensionIndexA]
}

// eslint-disable-next-line max-params
const findDifferentDimension = function (
  dimensionNames,
  firstDimensions,
  secondDimensions,
  startIndex,
) {
  return findIndexFrom(
    dimensionNames,
    (dimensionName) =>
      !isSameArray(
        firstDimensions[dimensionName],
        secondDimensions[dimensionName],
      ),
    startIndex,
  )
}

// Merge the values of two `dimensions`
// eslint-disable-next-line max-params
const concatValues = function (
  dimensionsArray,
  firstDimensions,
  secondDimensions,
  concatDimensionName,
  secondIndex,
) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  firstDimensions[concatDimensionName] = [
    ...firstDimensions[concatDimensionName],
    ...secondDimensions[concatDimensionName],
  ]
  // eslint-disable-next-line fp/no-mutating-methods
  dimensionsArray.splice(secondIndex, 1)
  return secondIndex - 1
}

// The first system is always for props matching all systems.
// If it has not been added yet, we do it here.
const addTopSystem = function (propGroups) {
  return propGroups.some(isTopPropGroup)
    ? propGroups
    : [{ propEntries: [], dimensionsArray: [] }, ...propGroups]
}

// Sort `propGroups` so that systems are shown in a good order in the footer:
//  - Top-level system first
//  - Then sorted to follow a specific order for the props
//  - If a prop has several values, the values are sorted too
// We sort all of:
//  - The systems
//  - The dimensions in each system's title
//  - The properties in each system
const sortSystems = function (propGroups) {
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

const isTopPropGroup = function ({ dimensionsArray }) {
  return dimensionsArray.length === 0
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

// Order where each property should be shown in the footer
const PROP_ORDER = ['aa', 'ff', 'bb', 'cc', 'dd', 'ee', 'gg', 'hh']

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
//  - sort `dimensionsArray` too, in each system
//  - refactor whole file
//  - debug the whole file, checking if each statement works
//  - break down file into several files
//  - this logic should come after `serialize.js`, i.e. there are no deep
//    properties and all properties values are strings
//     - However, the `system.title` logic should be moved after it
//  - fix `title` logic:
//     - transform each id string into { id: string, title: string }
//     - add `system.title`
//  - fix `PROP_ORDER` with real order (use one from `serialize.js`)
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
