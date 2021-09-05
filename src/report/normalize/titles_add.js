import mapObj from 'map-obj'

import { COMBINATION_DIMENSIONS } from '../../combination/dimensions.js'

// Allow users to rename identifiers from any combination dimension: tasks,
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

// Add `result.combinations[*].taskTitle|...`
export const addCombinationsTitles = function (
  { combinations, ...result },
  titles,
  showTitles,
) {
  const titlesA = showTitles ? titles : {}
  const combinationIdNames = COMBINATION_DIMENSIONS.map(getIdName)
  const combinationsA = combinations.map((combination) =>
    addTitles(combination, combinationIdNames, titlesA),
  )
  return { ...result, combinations: combinationsA }
}

const getIdName = function ({ idName }) {
  return idName
}

// Add `result.dimensions.*.title`
export const addDimensionsTitles = function (
  { dimensions, ...result },
  titles,
  showTitles,
) {
  const titlesA = showTitles ? titles : {}
  const dimensionsA = mapObj(dimensions, (dimension, items) => [
    dimension,
    addDimensionTitle(items, titlesA),
  ])
  return { ...result, dimensions: dimensionsA }
}

const addDimensionTitle = function (items, titles) {
  return items.map((item) => addTitle(item, 'id', titles))
}

// Add `footer.systems[*].title`
export const addFooterTitles = function (
  { systems, ...footer },
  titles,
  showTitles,
) {
  const titlesA = showTitles ? titles : {}
  const systemsA = systems.map((systemA) => addSystemTitle(systemA, titlesA))
  return { ...footer, systems: systemsA }
}

const addSystemTitle = function (system, titles) {
  return addTitle(system, 'id', titles)
}

// Add title to object if the corresponding title exists in the `titles`
// configuration property.
const addTitles = function (obj, idNames, titles) {
  return idNames.reduce((objA, idName) => addTitle(objA, idName, titles), obj)
}

const addTitle = function (obj, idName, titles) {
  const id = obj[idName]
  const { [id]: title = id } = titles

  if (title === undefined) {
    return obj
  }

  const titleName = TITLE_PROPS[idName]
  return { ...obj, [titleName]: title }
}

const TITLE_PROPS = {
  id: 'title',
  taskId: 'taskTitle',
  runnerId: 'runnerTitle',
  systemId: 'systemTitle',
}