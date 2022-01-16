import { mapValues } from '../../../utils/map.js'

// Merge the `versions` of either:
//  - The same result, but different runners or runnerConfig variations
//  - Two results with same ids, with same or different runners or runnerConfig
//    variations
// Since each combination might have different versions due to different runners
// and results, but are all reported in the merged result, we report all values
// as a concatenated list.
export const mergeVersions = function (versions, previousVersions) {
  return mapValues({ ...versions, ...previousVersions }, (_, propName) =>
    mergeVersionsValue(
      versions[propName],
      previousVersions[propName],
      propName,
    ),
  )
}

const mergeVersionsValue = function (values, previousValue, propName) {
  if (NO_CONCAT_VERSIONS.has(propName) || previousValue === undefined) {
    return values
  }

  if (values === undefined) {
    return previousValue
  }

  return mergeValues(values, previousValue)
}

const mergeValues = function (values, previousValue) {
  const valuesArray = values.split(VERSIONS_VALUE_SEPARATOR)
  return valuesArray.includes(previousValue)
    ? values
    : // eslint-disable-next-line fp/no-mutating-methods
      [...valuesArray, previousValue].sort().join(VERSIONS_VALUE_SEPARATOR)
}

// Some versions are too verbose when concatenated, so only keep the most
// recent value
const NO_CONCAT_VERSIONS = new Set(['Spyd'])

export const VERSIONS_VALUE_SEPARATOR = ', '
