import sortOn from 'sort-on'

import { getMean } from '../stats/sum.js'

import { COMBINATION_CATEGORIES } from './categories.js'

// Group combinations per category.
// Each category is assigned to a top-level result.categories.* property.
// It includes its mean speed and rank.
export const groupCategoryInfos = function (combinations) {
  return COMBINATION_CATEGORIES.reduce(addCategoryInfo, {
    combinations,
    categories: {},
  })
}

const addCategoryInfo = function (
  { combinations, categories },
  { propName, idName, rankName },
) {
  const ids = getCategoryIds(combinations, idName)
  const category = ids.map((id) => getCategory({ combinations, id, idName }))
  const categoryA = sortOn(category, 'mean')

  const combinationsA = combinations.map((combination) =>
    addRank({ combination, category: categoryA, idName, rankName }),
  )
  return {
    combinations: combinationsA,
    categories: { ...categories, [propName]: categoryA },
  }
}

const getCategoryIds = function (combinations, idName) {
  const ids = combinations.map((combination) => combination[idName])
  return [...new Set(ids)]
}

const getCategory = function ({ combinations, id, idName }) {
  const medians = combinations
    .filter((combination) => combination[idName] === id)
    .map(getCombinationMedian)
  const mean = getMean(medians)
  return { id, mean }
}

const getCombinationMedian = function ({ stats: { median } }) {
  return median
}

// Add speed rank within each category for each combination
const addRank = function ({ combination, category, idName, rankName }) {
  const rankValue = category.findIndex(({ id }) => id === combination[idName])
  return { ...combination, [rankName]: rankValue }
}
