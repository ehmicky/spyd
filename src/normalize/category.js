import sortOn from 'sort-on'

import { COMBINATION_CATEGORIES } from '../select/ids.js'
import { getMean } from '../stats/sum.js'
import { groupBy } from '../utils/group.js'

// Group combinations per category.
// Each category is assigned to a top-level result.categories.* property.
// It includes its mean speed and rank.
export const addCategoryInfos = function ({ combinations }) {
  const {
    combinations: combinationsA,
    ...categories
  } = COMBINATION_CATEGORIES.reduce(addCategoryInfo, { combinations })
  return { combinations: combinationsA, categories }
}

const addCategoryInfo = function (
  { combinations, ...categories },
  { propName, idName, titleName, rankName },
) {
  const category = Object.values(
    groupBy(combinations, idName),
  ).map((combinationsA) =>
    getCategory({ combinations: combinationsA, idName, titleName }),
  )
  const categoryA = sortOn(category, 'mean')

  const combinationsB = combinations.map((combination) =>
    addRank({ combination, catgory: categoryA, idName, rankName }),
  )
  return { combinations: combinationsB, ...categories, [propName]: categoryA }
}

const getCategory = function ({ combinations, idName, titleName }) {
  const { [idName]: id, [titleName]: title } = combinations[
    combinations.length - 1
  ]
  const medians = combinations.map(getCombinationMedian)
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
