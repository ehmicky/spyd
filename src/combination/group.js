import sortOn from 'sort-on'

import { getMean } from '../stats/sum.js'

import { COMBINATION_DIMENSIONS } from './dimensions.js'
import { sortCombinations } from './sort.js'

// Group combinations per dimension.
// Each dimension is assigned to a top-level result.dimensions.* property.
// It includes its mean speed and rank.
// Add `result.*` properties based on grouping combinations by dimension.
export const groupResultCombinations = function (result) {
  const { combinations: combinationsA, dimensions } = groupDimensionInfos(
    result.combinations,
  )
  const combinationsB = sortCombinations(combinationsA)
  return { ...result, combinations: combinationsB, dimensions }
}

const groupDimensionInfos = function (combinations) {
  return COMBINATION_DIMENSIONS.reduce(addDimensionInfo, {
    combinations,
    dimensions: {},
  })
}

const addDimensionInfo = function (
  { combinations, dimensions },
  { propName, idName, rankName },
) {
  const ids = getDimensionIds(combinations, idName)
  const dimension = ids.map((id) => getDimension({ combinations, id, idName }))
  const dimensionA = sortOn(dimension, 'mean')

  const combinationsA = combinations.map((combination) =>
    addRank({ combination, dimension: dimensionA, idName, rankName }),
  )
  return {
    combinations: combinationsA,
    dimensions: { ...dimensions, [propName]: dimensionA },
  }
}

const getDimensionIds = function (combinations, idName) {
  const ids = combinations.map((combination) => combination[idName])
  return [...new Set(ids)]
}

const getDimension = function ({ combinations, id, idName }) {
  const medians = combinations
    .filter((combination) => combination[idName] === id)
    .map(getCombinationMedian)
    .filter(isDefined)

  if (medians.length === 0) {
    return { id }
  }

  const mean = getMean(medians)
  return { id, mean }
}

const getCombinationMedian = function ({ stats: { median } }) {
  return median
}

// `median` is `undefined` when in preview mode on combinations not measured yet
// `dimension.mean` will be `undefined`, which is sorted last.
const isDefined = function (median) {
  return median !== undefined
}

// Add speed rank within each dimension for each combination
const addRank = function ({ combination, dimension, idName, rankName }) {
  const rankValue = dimension.findIndex(({ id }) => id === combination[idName])
  return { ...combination, [rankName]: rankValue }
}
