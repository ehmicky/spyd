import mapObj from 'map-obj'
import omit from 'omit.js'
import sortOn from 'sort-on'

import { isSameArray } from '../../utils/equal.js'
import { findIndexFrom } from '../../utils/find.js'
import { uniqueDeep, uniqueDeepUnordered } from '../../utils/unique.js'

/* eslint-disable max-nested-callbacks, max-lines-per-function, complexity, max-lines, fp/no-loops, max-statements, max-depth, no-unreachable-loop */
const mainLogic = function (systems) {
  const propEntries = listPropEntries(systems)
  const propGroups = getPropGroups(propEntries)
  const propGroupsA = reducePropDimensions(propGroups, systems)
  const propGroupsB = addTopSystem(propGroupsA)
  const propGroupsC = sortSystems(propGroupsB)
  const systemsA = finalizeSystems(propGroupsC)
  systemsA.forEach(({ dimensions, ...props }) => {
    console.log(props, dimensions)
  })
  return systemsA
}

const listPropEntries = function (systems) {
  const normalizedSystems = systems.map(normalizeSystemProps)
  const propNames = getUniquePropNames(normalizedSystems)
  const propEntries = getUniquePropEntries(propNames, normalizedSystems)
  const propEntriesA = propEntries.map((propEntry) =>
    addPropEntryDimensions(propEntry, normalizedSystems),
  )
  return propEntriesA
}

const normalizeSystemProps = function ({ dimensions, ...props }) {
  return { dimensions, props }
}

const getUniquePropNames = function (systems) {
  return [...new Set(systems.flatMap(getPropNames))]
}

const getPropNames = function ({ props }) {
  return Object.keys(props)
}

const getUniquePropEntries = function (propNames, systems) {
  return propNames.flatMap((propName) => getUniquePropEntry(propName, systems))
}

const getUniquePropEntry = function (propName, systems) {
  const propValues = [...new Set(systems.map(({ props }) => props[propName]))]
  return propValues.map((propValue) => ({ propName, propValue }))
}

const addPropEntryDimensions = function ({ propName, propValue }, systems) {
  const dimensionsArray = systems
    .filter(({ props }) => props[propName] === propValue)
    .map(({ dimensions }) => dimensions)
  return { propName, propValue, dimensionsArray }
}

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

const reducePropDimensions = function (propGroups, systems) {
  return propGroups.map((propGroup) =>
    reduceEachPropDimensions(propGroup, systems),
  )
}

const reduceEachPropDimensions = function (
  { propEntries, dimensionsArray },
  systems,
) {
  const dimensionsArrayA = reduceAllPropDimensions(dimensionsArray, systems)
  const dimensionsArrayB = uniqueDeep(dimensionsArrayA)
  const dimensionsArrayC = normalizeTopSystem(dimensionsArrayB)
  const dimensionsArrayD = concatDimensionsValues(dimensionsArrayC)
  return { propEntries, dimensionsArray: dimensionsArrayD }
}

const reduceAllPropDimensions = function (dimensionsArray, systems) {
  return dimensionsArray.reduce(
    reduceOnePropDimensions.bind(undefined, systems),
    dimensionsArray,
  )
}

const reduceOnePropDimensions = function (
  systems,
  dimensionsArray,
  dimensions,
  index,
) {
  return Object.keys(dimensions).reduceRight(
    reduceOneOnePropDimensions.bind(undefined, { systems, index }),
    dimensionsArray,
  )
}

const reduceOneOnePropDimensions = function (
  { systems, index },
  dimensionsArray,
  dimensionName,
) {
  const matching = systems.filter((system) =>
    isReducibleSystem({ system, dimensionsArray, index, dimensionName }),
  )
  return matching.length === dimensionsArray.length
    ? [
        ...dimensionsArray.slice(0, index),
        omit.default(dimensionsArray[index], [dimensionName]),
        ...dimensionsArray.slice(index + 1),
      ]
    : dimensionsArray
}

const isReducibleSystem = function ({
  system,
  dimensionsArray,
  index,
  dimensionName,
}) {
  return dimensionsArray.some((dimensions, indexB) =>
    isReducibleDimensions({
      system,
      dimensions,
      index,
      indexB,
      dimensionName,
    }),
  )
}

const isReducibleDimensions = function ({
  system,
  dimensions,
  index,
  indexB,
  dimensionName,
}) {
  return Object.entries(dimensions).every(([dimensionNameB, dimensionValueB]) =>
    isReducibleDimension({
      system,
      index,
      indexB,
      dimensionName,
      dimensionNameB,
      dimensionValueB,
    }),
  )
}

const isReducibleDimension = function ({
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

const normalizeTopSystem = function (dimensionsArray) {
  return dimensionsArray.filter(isNotEmptyDimensions)
}

const isNotEmptyDimensions = function (dimensions) {
  return Object.keys(dimensions).length !== 0
}

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

const addTopSystem = function (propGroups) {
  return propGroups.some(isTopPropGroup)
    ? propGroups
    : [{ propEntries: [], dimensionsArray: [] }, ...propGroups]
}

const sortSystems = function (propGroups) {
  // eslint-disable-next-line fp/no-mutating-methods
  return propGroups.map(addSortProps).sort(compareSystems)
}

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

  // eslint-disable-next-line unicorn/no-for-loop, fp/no-let, fp/no-mutation
  for (let index = 0; index < propEntriesA.length; index += 1) {
    const result = comparePropEntries(propEntriesA[index], propEntriesB[index])

    if (result !== 0) {
      return result
    }
  }

  return 0
}

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
//  - refactor whole file
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
mainLogic(SYSTEMS)
