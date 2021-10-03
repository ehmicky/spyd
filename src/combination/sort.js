import mapObj from 'map-obj'
import sortOn from 'sort-on'

import { getMean } from '../stats/sum.js'
import { groupBy } from '../utils/group.js'

import { getDimensions } from './ids.js'

// Sort `result.combinations` based on their `stats.mean`.
// Combinations with the same dimension are grouped together in the sorting
// order.
// This sorting order should be used by reporters to sort their rows.
// When grouping dimensions (e.g. using tables columns), some combinations
// of specific ids might be missing
//  - This can happen due to:
//     - `select` configuration property
//     - Variations being runner-specific
//  - Those should be filtered out, as opposed to showing empty rows|columns
export const sortCombinations = function (result) {
  const { combinations } = result
  const dimensions = getDimensions(combinations)
  const sortFunctions = dimensions.map((dimension) =>
    getSortFunction(dimension, combinations),
  )
  const combinationsA = sortOn(combinations, sortFunctions)
  return { ...result, combinations: combinationsA }
}

// Retrieve a function used to compare combinations for a specific dimension
const getSortFunction = function (dimension, combinations) {
  const meansOfMeans = mapObj(
    groupBy(combinations, ({ dimensions }) => dimensions[dimension].id),
    getMeanOfMeans,
  )
  return getCombinationOrder.bind(undefined, dimension, meansOfMeans)
}

// Retrieve the mean of all `stat.mean` for a specific dimension and id.
// `undefined` means are omitted. Ids with all means undefined are sorted last.
const getMeanOfMeans = function (id, combinations) {
  const means = combinations.map(getCombinationMean).filter(isDefined)
  const meanOfMeans =
    means.length === 0 ? Number.POSITIVE_INFINITY : getMean(means)
  return [id, meanOfMeans]
}

const getCombinationMean = function ({ stats: { mean } }) {
  return mean
}

const isDefined = function (mean) {
  return mean !== undefined
}

const getCombinationOrder = function (dimension, meansOfMeans, { dimensions }) {
  const { id } = dimensions[dimension]
  return meansOfMeans[id]
}
