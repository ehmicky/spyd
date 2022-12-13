import { isSameArray } from '../../../utils/equal.js'
import { uniqueDeepUnordered } from '../../../utils/unique.js'

// Group `propEntries` together if they share the same `dimensionsArray`.
// Like this, system properties applying to the same dimensions are shown
// together.
export const getPropGroups = (propEntries) => {
  const dimensionsArrays = uniqueDeepUnordered(
    propEntries.map(getPropEntryDimensions),
  )
  const propGroups = dimensionsArrays.map((dimensionsArray) =>
    getPropGroup(dimensionsArray, propEntries),
  )
  return propGroups
}

const getPropEntryDimensions = ({ dimensionsArray }) => dimensionsArray

const getPropGroup = (dimensionsArray, propEntries) => {
  const propEntriesA = propEntries
    .filter(({ dimensionsArray: dimensionsArrayB }) =>
      isSameArray(dimensionsArray, dimensionsArrayB),
    )
    .map(removeDimensionsArray)
  return { propEntries: propEntriesA, dimensionsArray }
}

const removeDimensionsArray = ({ propName, propValue }) => ({
  propName,
  propValue,
})
