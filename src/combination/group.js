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
  { propName, idName, titleName, rankName },
) {
  const ids = getCategoryIds(combinations, idName)
  const category = ids.map((id) =>
    getCategory({ combinations, id, idName, titleName }),
  )
  const categoryA = sortOn(category, 'mean')

  const combinationsB = combinations.map((combination) =>
    addRank({ combination, catgory: categoryA, idName, rankName }),
  )
  return {
    combinations: combinationsB,
    categories: { ...categories, [propName]: categoryA },
  }
}

const getCategoryIds = function (combinations, idName) {
  const ids = combinations.map((combination) => combination[idName])
  return [...new Set(ids)]
}

// After merging, several combinations with the same category id might have
// different category titles. We prioritize the most recent result.
const getCategory = function ({ combinations, id, idName, titleName }) {
  const combinationsA = combinations.filter(
    (combination) => combination[idName] === id,
  )
  const [{ [titleName]: title }] = combinationsA
  const medians = combinationsA.map(getCombinationMedian)
  const mean = getMean(medians)
  return { id, title, mean }
}

const getCombinationMedian = function ({ stats: { median } }) {
  return median
}

// Add speed rank within each category for each combination
const addRank = function ({ combination, category, idName, rankName }) {
  const rankValue = category.findIndex(({ id }) => id === combination[idName])
  return { ...combination, [rankName]: rankValue }
}
