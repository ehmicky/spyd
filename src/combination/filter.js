import omit from 'omit.js'

// Filter `noDimensions` from result, during reporting
export const omitNoDimensions = function (result, noDimensions) {
  const combinations = result.combinations.map((combination) =>
    omitCombNoDimensions(combination, noDimensions),
  )
  return { ...result, combinations }
}

const omitCombNoDimensions = function (combination, noDimensions) {
  const dimensions = omit.default(combination.dimensions, noDimensions)
  return { ...combination, dimensions }
}

// Like `listNoDimensions` but using combinations
export const getNoDimensions = function (combinations) {
  const dimensionsArray = combinations.map(getCombinationDimensions)
  return listNoDimensions(dimensionsArray)
}

const getCombinationDimensions = function ({ dimensions }) {
  return dimensions
}

// Retrieve `noDimensions`, i.e. dimensions that have the same ids across all
// combinations. Those are not reported, since they are redundant for users.
export const listNoDimensions = function (dimensionsArray) {
  const propNames = Object.keys(dimensionsArray[0])
  return propNames.filter((propName) =>
    isNoDimensions(dimensionsArray, propName),
  )
}

const isNoDimensions = function (dimensionsArray, propName) {
  const ids = dimensionsArray.map((dimensions) => dimensions[propName].id)
  return [...new Set(ids)].length === 1
}
