import { isDeepStrictEqual } from 'util'

import mapObj from 'map-obj'
import omit from 'omit.js'

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
  const systemsA = systems.map(({ dimensions, ...props }) => ({
    dimensions,
    props,
  }))
  const uniquePropNames = [
    ...new Set(systemsA.flatMap(({ props }) => Object.keys(props))),
  ]
  const uniquePropEntries = uniquePropNames.flatMap((propName) =>
    [...new Set(systemsA.map(({ props }) => props[propName]))].map(
      (propValue) => [propName, propValue],
    ),
  )
  const propDimensions = uniquePropEntries.map(([propName, propValue]) => {
    const allDimensions = systemsA
      .filter(({ props }) => props[propName] === propValue)
      .map(({ dimensions }) => dimensions)
    return [propName, propValue, allDimensions]
  })
  return propDimensions
}

const groupPropDimensions = function (propDimensions) {
  const uniqueAllDimensions = propDimensions
    .map(([, , allDimensions]) => allDimensions)
    .filter((allDimensions, index, allAllDimensions) =>
      allAllDimensions
        .slice(index + 1)
        .every((allDimensionsB) => !isSameArray(allDimensions, allDimensionsB)),
    )
  const groupedPropDimensions = uniqueAllDimensions.map((allDimensions) => {
    const propEntries = propDimensions
      .filter(([, , allDimensionsB]) =>
        isSameArray(allDimensions, allDimensionsB),
      )
      .map(([propName, propValue]) => [propName, propValue])
    return [propEntries, allDimensions]
  })
  return groupedPropDimensions
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
    (allDimensionsA, dimensions, index) =>
      Object.keys(dimensions).reduceRight((allDimensionsB, dimensionName) => {
        const matching = systems.filter((system) =>
          allDimensionsB.some((dimensionsB, indexB) =>
            Object.entries(dimensionsB).every(
              ([dimensionNameB, dimensionValueB]) =>
                system.dimensions[dimensionNameB] === dimensionValueB ||
                (indexB === index && dimensionNameB === dimensionName),
            ),
          ),
        )

        if (matching.length !== allDimensionsB.length) {
          return allDimensionsB
        }

        return [
          ...allDimensionsB.slice(0, index),
          omit.default(allDimensionsB[index], [dimensionName]),
          ...allDimensionsB.slice(index + 1),
        ]
      }, allDimensionsA),
    allDimensions,
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
  return allDimensions.filter(
    (dimensions) => Object.keys(dimensions).length !== 0,
  )
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
  return reducedPropDimensions.some(
    ([, allDimensions]) => allDimensions.length === 0,
  )
    ? reducedPropDimensions
    : [[[], []], ...reducedPropDimensions]
}

const sortSystems = function (finalPropDimensions) {
  return finalPropDimensions
    .map(([propEntries, allDimensions]) => {
      const hasNoDimensions = allDimensions.length === 0
      const propEntriesA = propEntries.sort(([propNameA], [propNameB]) => {
        const propOrderA = PROP_ORDER.indexOf(propNameA)
        const propOrderB = PROP_ORDER.indexOf(propNameB)
        return propOrderA > propOrderB ? 1 : -1
      })
      return { hasNoDimensions, propEntries: propEntriesA, allDimensions }
    })
    .sort((first, second) => {
      if (first.hasNoDimensions) {
        return -1
      }

      if (second.hasNoDimensions) {
        return 1
      }

      for (let index = 0; index < first.propEntries.length; index += 1) {
        if (second.propEntries[index] === undefined) {
          return 1
        }

        const propOrderA = PROP_ORDER.indexOf(first.propEntries[index][0])
        const propOrderB = PROP_ORDER.indexOf(second.propEntries[index][0])

        if (propOrderA > propOrderB) {
          return 1
        }

        if (propOrderA < propOrderB) {
          return -1
        }

        const firstValue = first.propEntries[index][1]
        const secondValue = second.propEntries[index][1]

        if (firstValue > secondValue) {
          return 1
        }

        if (firstValue < secondValue) {
          return -1
        }
      }

      return 1
    })
}

const finalizeSystems = function (sortedGroupedPropDimensions) {
  return sortedGroupedPropDimensions.map(({ propEntries, allDimensions }) => {
    const props = Object.fromEntries(propEntries)
    return { dimensions: allDimensions, ...props }
  })
}

const isSameArray = function (arrayA, arrayB) {
  return (
    arrayA.length === arrayB.length &&
    arrayA.every((valueA) =>
      arrayB.some((valueB) => isDeepStrictEqual(valueA, valueB)),
    )
  )
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
