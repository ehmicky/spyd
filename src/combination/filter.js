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
  const ids = dimensionsArray.map((dimensions) => dimensions[propName])
  return [...new Set(ids)].length === 1
}
