import { isSameArray } from '../../../utils/equal.js'
import { uniqueDeepUnordered } from '../../../utils/unique.js'

// Group `propEntries` together if they share the same `dimensionsArray`.
// Like this, system properties applying to the same dimensions are shown
// together.
export const getPropGroups = function (propEntries) {
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
