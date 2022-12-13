import sortOn from 'sort-on'

import { getMean } from '../stats/sum.js'
import { groupBy } from '../utils/group.js'
import { mapValues } from '../utils/map.js'

import { getCombsDimensions } from './dimensions.js'

// Sort `result.combinations` based on their `stats.mean`.
// Combinations with the same dimension are grouped together in the sorting
// order.
// The dimensions are ordered too.
// This sorting order should be used by reporters to sort their rows.
// When grouping dimensions (e.g. using tables columns), some combinations
// of specific ids might be missing
//  - This can happen due to:
//     - `select` configuration property
//     - Variations being runner-specific
//  - Those should be filtered out, as opposed to showing empty rows|columns
export const sortCombinations = (result) => {
  const { combinations } = result
  const dimensions = getCombsDimensions(combinations)
  const sortFunctions = dimensions.map((dimension) =>
    getSortFunction(dimension, combinations),
  )
  const combinationsA = sortOn(combinations, sortFunctions)
  return { ...result, combinations: combinationsA }
}

// Retrieve a function used to compare combinations for a specific dimension
const getSortFunction = ({ propName }, combinations) => {
  const combinationsGroups = groupBy(
    combinations,
    ({ dimensions }) => dimensions[propName].id,
  )
  const meansOfMeans = mapValues(combinationsGroups, getMeanOfMeans)
  return getCombinationOrder.bind(undefined, propName, meansOfMeans)
}

// Retrieve the mean of all `stat.mean` for a specific dimension and id.
// `undefined` means are omitted. Ids with all means undefined are sorted last.
const getMeanOfMeans = (combinations) => {
  const means = combinations.map(getCombinationMean).filter(isDefined)
  return means.length === 0 ? Number.POSITIVE_INFINITY : getMean(means)
}

const getCombinationMean = ({ stats: { mean } }) => mean

const isDefined = (mean) => mean !== undefined

const getCombinationOrder = (propName, meansOfMeans, { dimensions }) => {
  const { id } = dimensions[propName]
  return meansOfMeans[id]
}
