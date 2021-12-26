import { isDeepStrictEqual } from 'util'

import mapObj from 'map-obj'
import omit from 'omit.js'
import sortOn from 'sort-on'

/* eslint-disable max-nested-callbacks, max-lines-per-function, complexity, max-lines, fp/no-loops, max-statements, max-depth, no-unreachable-loop */
const mainLogic = function (systems) {
  const propDimensions = getPropDimensions(systems)
  const groupedPropDimensions = groupPropDimensions(propDimensions)
  const reducedPropDimensions = reducePropDimensions(
    groupedPropDimensions,
    systems,
  )
  const finalPropDimensions = addTopSharedSystem(reducedPropDimensions)
  const sortedGroupedPropDimensions = sortSystems(finalPropDimensions)
  const systemsA = finalizeSystems(sortedGroupedPropDimensions)
  systemsA.forEach(({ dimensions, ...props }) => {
    console.log(props, dimensions)
  })
  return systemsA
}

const getPropDimensions = function (systems) {
  const normalizedSystems = systems.map(normalizeSystemProps)
  const propNames = getUniquePropNames(normalizedSystems)
  const propEntries = getUniquePropEntries(propNames, normalizedSystems)
  const propDimensions = propEntries.map((propEntry) =>
    getPropDimension(propEntry, normalizedSystems),
  )
  return propDimensions
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

const getPropDimension = function ({ propName, propValue }, systems) {
  const allDimensions = systems
    .filter(({ props }) => props[propName] === propValue)
    .map(({ dimensions }) => dimensions)
  return [propName, propValue, allDimensions]
}

const groupPropDimensions = function (propDimensions) {
  const uniqueAllDimensions = getUniqueAllDimensions(propDimensions)
  const groupedPropDimensions = uniqueAllDimensions.map((allDimensions) =>
    groupPropDimension(allDimensions, propDimensions),
  )
  return groupedPropDimensions
}

const getUniqueAllDimensions = function (propDimensions) {
  return propDimensions.map(getAllDimensionsProp).filter(isUniqueAllDimensions)
}

const getAllDimensionsProp = function ([, , allDimensions]) {
  return allDimensions
}

const isUniqueAllDimensions = function (
  allDimensions,
  index,
  allAllDimensions,
) {
  return allAllDimensions
    .slice(index + 1)
    .every((allDimensionsB) => !isSameArray(allDimensions, allDimensionsB))
}

const groupPropDimension = function (allDimensions, propDimensions) {
  const propEntries = propDimensions
    .filter(([, , allDimensionsB]) =>
      isSameArray(allDimensions, allDimensionsB),
    )
    .map(getGroupedDimension)
  return [propEntries, allDimensions]
}

const getGroupedDimension = function ([propName, propValue]) {
  return [propName, propValue]
}

const reducePropDimensions = function (groupedPropDimensions, systems) {
  return groupedPropDimensions.map(([propEntries, allDimensions]) =>
    reduceEachPropDimensions(propEntries, allDimensions, systems),
  )
}

const reduceEachPropDimensions = function (
  propEntries,
  allDimensions,
  systems,
) {
  const allDimensionsC = reduceAllPropDimensions(allDimensions, systems)
  const allDimensionsE = removeDuplicateDimensions(allDimensionsC)
  const allDimensionsF = normalizeTopSystem(allDimensionsE)
  const allDimensionsG = appendValues(allDimensionsF)
  return [propEntries, allDimensionsG]
}

const reduceAllPropDimensions = function (allDimensions, systems) {
  return allDimensions.reduce(
    reduceOnePropDimensions.bind(undefined, systems),
    allDimensions,
  )
}

const reduceOnePropDimensions = function (
  systems,
  allDimensionsA,
  dimensions,
  index,
) {
  return Object.keys(dimensions).reduceRight(
    reduceOneOnePropDimensions.bind(undefined, { systems, index }),
    allDimensionsA,
  )
}

const reduceOneOnePropDimensions = function (
  { systems, index },
  allDimensionsB,
  dimensionName,
) {
  const matching = systems.filter((system) =>
    isReducibleSystem({ system, allDimensionsB, index, dimensionName }),
  )
  return matching.length === allDimensionsB.length
    ? [
        ...allDimensionsB.slice(0, index),
        omit.default(allDimensionsB[index], [dimensionName]),
        ...allDimensionsB.slice(index + 1),
      ]
    : allDimensionsB
}

const isReducibleSystem = function ({
  system,
  allDimensionsB,
  index,
  dimensionName,
}) {
  return allDimensionsB.some((dimensionsB, indexB) =>
    isReducibleDimensions({
      system,
      dimensionsB,
      index,
      indexB,
      dimensionName,
    }),
  )
}

const isReducibleDimensions = function ({
  system,
  dimensionsB,
  index,
  indexB,
  dimensionName,
}) {
  return Object.entries(dimensionsB).every(
    ([dimensionNameB, dimensionValueB]) =>
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

const removeDuplicateDimensions = function (allDimensions) {
  return allDimensions.filter((dimensions, index, allDimensionsA) =>
    allDimensionsA
      .slice(index + 1)
      .every((dimensionsB) => !isDeepStrictEqual(dimensions, dimensionsB)),
  )
}

const normalizeTopSystem = function (allDimensions) {
  return allDimensions.filter(isNotEmptyDimensions)
}

const isNotEmptyDimensions = function (dimensions) {
  return Object.keys(dimensions).length !== 0
}

const appendValues = function (allDimensions) {
  let allDimensionsA = allDimensions.map((dimensions) =>
    mapObj(dimensions, (dimensionName, dimensionValue) => [
      dimensionName,
      [dimensionValue],
    ]),
  )

  let clean = true

  do {
    clean = true

    for (
      let firstIndex = 0;
      clean && firstIndex < allDimensionsA.length - 1;
      firstIndex += 1
    ) {
      const firstDimensions = allDimensionsA[firstIndex]
      const dimensionNames = Object.keys(firstDimensions)

      for (
        let secondIndex = firstIndex + 1;
        clean && secondIndex < allDimensionsA.length;
        secondIndex += 1
      ) {
        const secondDimensions = allDimensionsA[secondIndex]
        const secondDimensionNames = Object.keys(secondDimensions)

        if (!isSameArray(dimensionNames, secondDimensionNames)) {
          continue
        }

        const differentDimensionNames = dimensionNames.filter(
          (dimensionName) =>
            !isSameArray(
              firstDimensions[dimensionName],
              secondDimensions[dimensionName],
            ),
        )

        if (differentDimensionNames.length !== 1) {
          continue
        }

        const [differentDimensionName] = differentDimensionNames
        const newDimensionValue = [
          ...firstDimensions[differentDimensionName],
          ...secondDimensions[differentDimensionName],
        ]
        const newDimensions = mapObj(
          firstDimensions,
          (dimensionName, dimensionValue) => [
            dimensionName,
            dimensionName === differentDimensionName
              ? newDimensionValue
              : dimensionValue,
          ],
        )
        allDimensionsA = allDimensionsA
          .map((dimensions, index) =>
            index === firstIndex ? newDimensions : dimensions,
          )
          .filter((dimensions, index) => index !== secondIndex)
        clean = false
      }
    }
  } while (!clean)

  return allDimensionsA
}

const addTopSharedSystem = function (reducedPropDimensions) {
  return reducedPropDimensions.some(isTopSharedSystem)
    ? reducedPropDimensions
    : [[[], []], ...reducedPropDimensions]
}

const isTopSharedSystem = function ([, allDimensions]) {
  return allDimensions.length === 0
}

const sortSystems = function (finalPropDimensions) {
  return finalPropDimensions.map(addSortProps).sort(compareSystems)
}

const addSortProps = function ([propEntries, allDimensions]) {
  const hasNoDimensions = allDimensions.length === 0
  const propEntriesA = propEntries.map(addPropOrder)
  const propEntriesB = sortOn(propEntriesA, ['propOrder'])
  return { hasNoDimensions, propEntries: propEntriesB, allDimensions }
}

const addPropOrder = function ([propName, propValue]) {
  const propOrder = PROP_ORDER.indexOf(propName)
  return { propName, propValue, propOrder }
}

const compareSystems = function (
  { hasNoDimensions: hasNoDimensionsA, propEntries: propEntriesA },
  { hasNoDimensions: hasNoDimensionsB, propEntries: propEntriesB },
) {
  if (hasNoDimensionsA) {
    return -1
  }

  if (hasNoDimensionsB) {
    return 1
  }

  // eslint-disable-next-line
  for (let index = 0; index < propEntriesA.length; index += 1) {
    const propEntryB = propEntriesB[index]

    if (propEntryB === undefined) {
      return 1
    }

    const propEntryA = propEntriesA[index]

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
  }

  return 1
}

const finalizeSystems = function (sortedGroupedPropDimensions) {
  return sortedGroupedPropDimensions.map(finalizeSystem)
}

const finalizeSystem = function ({ propEntries, allDimensions }) {
  const props = Object.fromEntries(propEntries.map(getDimensionEntry))
  return { dimensions: allDimensions, ...props }
}

const getDimensionEntry = function ({ propName, propValue }) {
  return [propName, propValue]
}

const isSameArray = function (arrayA, arrayB) {
  return (
    arrayA.length === arrayB.length &&
    arrayA.every((value) => hasArrayValue(arrayB, value))
  )
}

// Like `Array.includes()` but using deep comparison
const hasArrayValue = function (array, valueA) {
  return array.some((valueB) => isDeepStrictEqual(valueA, valueB))
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
