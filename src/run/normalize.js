import mapObj from 'map-obj'

import { setArray } from '../utils/set.js'

// Normalize the rawResult after measuring
export const normalizeMeasuredResult = function (rawResult) {
  const combinations = rawResult.combinations.map(normalizeCombination)
  return { ...rawResult, combinations }
}

// Only keep the properties we need when saving to the history file
const normalizeCombination = function ({ dimensions, stats }) {
  const dimensionsA = mapObj(dimensions, getIdProp)
  return { dimensions: dimensionsA, stats }
}

const getIdProp = function (propName, { id }) {
  return [propName, { id }]
}

// Update post-reporting-normalization `result.combinations[index].stats` based
// on pre-reporting-normalization `rawResult.combinations[index].stats`.
// This assumes that the early reporting normalization logic does not change
// `result.combinations` array order, except for appending new ones.
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
