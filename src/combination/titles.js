import mapObj from 'map-obj'

import { COMBINATION_CATEGORIES } from './categories.js'

// Allow users to rename identifiers from any combination category: tasks,
// runners, systems, variations. Shown only in reporters.
// We purposely show identifiers by default, i.e. titles need opt-in because:
//  - they are more useful for users because they are used for selection
//  - titles are not meant for user directly but for sharing the reports with
//    others (e.g. with `insert` and `output`).
// Titles are specified in the configuration instead of inside task files
// because:
//   - allow starting to report titles without waiting for combination processes
//     to be loaded
//   - provides a single place for all identifiers, which is simpler
//   - removes the need for runners to handle this
export const addTitles = function (combinations, titles) {
  return combinations.map((combination) =>
    addCombinationTitles(combination, titles),
  )
}

const addCombinationTitles = function (combination, titles) {
  return COMBINATION_CATEGORIES.reduce(
    addCombinationTitle.bind(undefined, titles),
    combination,
  )
}

const addCombinationTitle = function (
  titles,
  combination,
  { idName, titleName },
) {
  const title = getCombinationTitle({ combination, idName, titleName, titles })
  return { ...combination, [titleName]: title }
}

// We default to using the `id` unless a title is already set, which is the case
// for `runner.title`.
const getCombinationTitle = function ({
  combination,
  idName,
  titleName,
  titles,
}) {
  const id = combination[idName]

  if (titles[id] !== undefined) {
    return titles[id]
  }

  if (combination[titleName] !== undefined) {
    return combination[titleName]
  }

  return id
}

// When `showTitles` is `false`, we show identifiers instead of titles.
// Identifiers are shown by default instead of titles because they are most
// useful, e.g. for selecting with `include` and `exclude`.
// Titles can be configured with `titles` but requires an explicit opt-in to
// be shown in reporters.
// We do this by replacing every `title` by `id` in the `result` passed to
// reporters so that reporters do not need to handle it: they should just show
// any `title` property.
export const removeTitles = function (result, showTitles) {
  if (showTitles) {
    return result
  }

  return removeResultTitles(result)
}

const removeResultTitles = function (result) {
  const resultA = removeCombinationsTitles(result)
  const resultB = removeCategoriesTitles(resultA)
  const resultC = removeSystemsTitles(resultB)
  const resultD = removePreviousTitles(resultC)
  return resultD
}

const removeCombinationsTitles = function ({ combinations, ...result }) {
  return { ...result, combinations: combinations.map(removeCombinationTitles) }
}

const removeCombinationTitles = function ({
  taskId,
  runnerId,
  systemId,
  ...combination
}) {
  return {
    ...combination,
    taskId,
    taskTitle: taskId,
    runnerId,
    runnerTitle: runnerId,
    systemId,
    systemTitle: systemId,
  }
}

const removeCategoriesTitles = function ({ categories, ...result }) {
  return { ...result, categories: mapObj(categories, removeCategoryTitle) }
}

const removeCategoryTitle = function (category, items) {
  const itemsA = items.map(removeItemTitle)
  return [category, itemsA]
}

const removeItemTitle = function ({ id, ...item }) {
  return { ...item, id, title: id }
}

// In `previous`, `system` is used.
// In the last merged result, `systems` is used instead.
const removeSystemsTitles = function ({ systems, system, ...result }) {
  if (system !== undefined) {
    return { ...result, system: removeSystemTitle(system) }
  }

  return { ...result, systems: systems.map(removeSystemTitle) }
}

const removeSystemTitle = function ({ id, ...obj }) {
  return id === undefined ? obj : { ...obj, id, title: id }
}

// `previous` is `undefined` when recursing over `previous`.
const removePreviousTitles = function ({ previous, ...result }) {
  if (previous === undefined) {
    return result
  }

  return { ...result, previous: previous.map(removeResultTitles) }
}
