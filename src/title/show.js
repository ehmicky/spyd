import mapObj from 'map-obj'

import { COMBINATION_CATEGORIES } from '../combination/categories.js'

import { addTitles, addTitle } from './add.js'

// Allow users to rename identifiers from any combination category: tasks,
// runners, systems, variations.
// Shown only in reporters. Computed during reporting, i.e. not persisted in
// history.
// We purposely show identifiers by default, i.e. titles need opt-in using the
// `showTitles` property because:
//  - they are more useful for users because they are used for selection
//  - titles are not meant for user directly but for sharing the reports with
//    others (e.g. with `output`).
// Titles are specified in the configuration instead of inside task files
// because this:
//   - allows starting to report titles without waiting for combination
//     processes to be loaded
//   - provides a single place for all identifiers, which is simpler
//   - removes the need for runners to handle this
// We do this by adding a `title` property for every `id` property.
export const showResultTitles = function (result, titles, showTitles) {
  const titlesA = showTitles ? titles : {}
  const resultA = addCombinationsTitles(result, titlesA)
  const resultB = addCategoriesTitles(resultA, titlesA)
  const resultC = addSystemsTitles(resultB, titlesA)
  return resultC
}

const addCombinationsTitles = function ({ combinations, ...result }, titles) {
  const combinationIdNames = COMBINATION_CATEGORIES.map(getIdName)
  const combinationsA = combinations.map((combination) =>
    addTitles(combination, combinationIdNames, titles),
  )
  return { ...result, combinations: combinationsA }
}

const getIdName = function ({ idName }) {
  return idName
}

const addCategoriesTitles = function ({ categories, ...result }, titles) {
  const categoriesA = mapObj(categories, (category, items) => [
    category,
    addCategoryTitle(category, items, titles),
  ])
  return { ...result, categories: categoriesA }
}

const addCategoryTitle = function (category, items, titles) {
  return items.map((item) => addTitle(item, 'id', titles))
}

const addSystemsTitles = function ({ systems, ...result }, titles) {
  const systemsA = systems.map((systemA) => addSystemTitle(systemA, titles))
  return { ...result, systems: systemsA }
}

const addSystemTitle = function (system, titles) {
  return addTitle(system, 'id', titles)
}
