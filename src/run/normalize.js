import { mapValues } from '../utils/map.js'
import { setArray } from '../utils/set.js'

// Transform:
//  - A `newResult`: used by the measuring logic
//  - To a `rawResult`: persisted in result files
export const normalizeNewResult = function (newResult) {
  const combinations = newResult.combinations.map(normalizeNewCombination)
  return { ...newResult, combinations }
}

const normalizeNewCombination = function ({
  dimensions,
  stats,
  system,
  versions,
}) {
  const dimensionsA = mapValues(dimensions, getIdProp)
  return { dimensions: dimensionsA, stats, system, versions }
}

const getIdProp = function ({ id }) {
  return { id }
}

// Update:
//  - `result`'s stats
//  - Based on `newResult`'s stats
// In principle, previews should do their own `reportStart()`, so that previews
// and non-previews can both follow the same `newResult -> rawResult -> result`
// order.
//  - However, we make them share the same `reportStart()` so it is called only
//    once, as a performance optimization
//  - This means `result` must be updated with new `stats` from `rawResult`
//  - We do it too before each preview, due to them calling reporting many
//    times, so that `reportStart()` is only called once
// This assumes that the newResult -> rawResult -> result normalization logic
// does not change `combinations` array order, except for appending new ones.
// Done after measuring all combinations.
export const updateCombinationsStats = function (result, combinations) {
  return combinations
    .map(getCombinationStats)
    .reduce(updateCombinationStats, result)
}

const getCombinationStats = function ({ stats }) {
  return stats
}

// Same for a single combination.
// Done before each preview.
export const updateCombinationStats = function (result, stats, index) {
  const combination = { ...result.combinations[index], stats }
  const combinations = setArray(result.combinations, index, combination)
  return { ...result, combinations }
}
