import mapObj from 'map-obj'

// Merge the `versions` of either:
//  - The same result, but different runners or runnerConfig variations
//  - Two results with same ids, with same or different runners or runnerConfig
//    variations
// Since each combination might have different versions due to different runners
// and results, but are all reported in the merged result, we report all values
// as a concatenated list.
export const mergeVersions = function (versions, previousVersions) {
  return mapObj({ ...versions, ...previousVersions }, (propName) =>
    mergeVersionsProp(versions, previousVersions, propName),
  )
}

const mergeVersionsProp = function (versions, previousVersions, propName) {
  const value = mergeVersionsValue(
    versions[propName],
    previousVersions[propName],
  )
  return [propName, value]
}

const mergeVersionsValue = function (values, previousValue) {
  if (values === undefined) {
    return previousValue
  }

  if (previousValue === undefined) {
    return values
  }

  const valuesArray = values.split(VERSIONS_VALUE_SEPARATOR)
  return valuesArray.includes(previousValue)
    ? values
    : // eslint-disable-next-line fp/no-mutating-methods
      [...valuesArray, previousValue].sort().join(VERSIONS_VALUE_SEPARATOR)
}

export const VERSIONS_VALUE_SEPARATOR = ', '
