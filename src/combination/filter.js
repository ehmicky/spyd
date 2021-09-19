import omit from 'omit.js'

// Retrieve `noDimensions`, i.e. dimensions that have the same ids across all
// combinations. Those are not reported, since they are redundant for users.
export const getNoDimensions = function (combinations) {
  const dimensionsArray = combinations.map(getCombinationDimensions)
  return getCombNoDimensions(dimensionsArray)
}

const getCombinationDimensions = function ({ dimensions }) {
  return dimensions
}

export const getCombNoDimensions = function (dimensionsArray) {
  const propNames = Object.keys(dimensionsArray[0])
  return propNames.filter((propName) =>
    isNoDimensions(dimensionsArray, propName),
  )
}

const isNoDimensions = function (dimensionsArray, propName) {
  const ids = dimensionsArray.map((dimensions) => dimensions[propName].id)
  return [...new Set(ids)].length === 1
}

// Filter `noDimensions` from result, during reporting.
// This is split from `getNoDimensions()` for performance reason:
//   - Retrieving `noDimensions` can be performed once per run
//   - But applying `noDimensions` might be repeated on many results or many
//     previews
export const omitNoDimensions = function (result, noDimensions) {
  const combinations = result.combinations.map((combination) =>
    omitCombNoDimensions(combination, noDimensions),
  )
  return { ...result, combinations }
}

export const omitCombNoDimensions = function (combination, noDimensions) {
  const dimensions = omit.default(combination.dimensions, noDimensions)
  return { ...combination, dimensions }
}
