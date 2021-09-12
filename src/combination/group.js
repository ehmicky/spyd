import sortOn from 'sort-on'

import { getMean } from '../stats/sum.js'

import { COMBINATION_DIMENSIONS } from './dimensions.js'

// Add `combination.*Rank` for each dimension based on `stat.mean`.
// Then sort combinations based on it.
export const groupResultCombinations = function (result) {
  const combinations = COMBINATION_DIMENSIONS.reduce(
    addDimensionInfo,
    result.combinations,
  )
  const combinationsA = sortOn(combinations, SORT_ORDER)
  return { ...result, combinations: combinationsA }
}

const addDimensionInfo = function (combinations, { idName, rankName }) {
  const ids = getDimensionIds(combinations, idName)
  const dimension = ids.map((id) => getDimension({ combinations, id, idName }))
  const dimensionA = sortOn(dimension, 'mean')
  return combinations.map((combination) =>
    addRank({ combination, dimension: dimensionA, idName, rankName }),
  )
}

const getDimensionIds = function (combinations, idName) {
  const ids = combinations.map((combination) => combination[idName])
  return [...new Set(ids)]
}

const getDimension = function ({ combinations, id, idName }) {
  const means = combinations
    .filter((combination) => combination[idName] === id)
    .map(getCombinationMean)
    .filter(isDefined)

  if (means.length === 0) {
    return { id }
  }

  const mean = getMean(means)
  return { id, mean }
}

const getCombinationMean = function ({ stats: { mean } }) {
  return mean
}

// `mean` is `undefined` when in preview mode on combinations not measured yet
// `dimension.mean` will be `undefined`, which is sorted last.
const isDefined = function (mean) {
  return mean !== undefined
}

// Add speed rank within each dimension for each combination
const addRank = function ({ combination, dimension, idName, rankName }) {
  const rankValue = dimension.findIndex(({ id }) => id === combination[idName])
  return { ...combination, [rankName]: rankValue }
}

const SORT_ORDER = ['taskRank', 'runnerRank', 'systemRank']
