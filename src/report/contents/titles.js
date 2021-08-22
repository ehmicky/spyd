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
export const showResultTitles = function (result, titles, showTitles) {
  const titlesA = showTitles ? titles : {}
  const resultA = addCombinationsTitles(result, titlesA)
  const resultB = addDimensionsTitles(resultA, titlesA)
  const resultC = addSystemsTitles(resultB, titlesA)
  return resultC
}

const addCombinationsTitles = function ({ combinations, ...result }, titles) {
  const combinationIdNames = COMBINATION_DIMENSIONS.map(getIdName)
  const combinationsA = combinations.map((combination) =>
    addTitles(combination, combinationIdNames, titles),
  )
  return { ...result, combinations: combinationsA }
}

const getIdName = function ({ idName }) {
  return idName
}

const addDimensionsTitles = function ({ dimensions, ...result }, titles) {
  const dimensionsA = mapObj(dimensions, (dimension, items) => [
    dimension,
    addDimensionTitle(items, titles),
  ])
  return { ...result, dimensions: dimensionsA }
}

const addDimensionTitle = function (items, titles) {
  return items.map((item) => addTitle(item, 'id', titles))
}

const addSystemsTitles = function ({ systems, ...result }, titles) {
  const systemsA = systems.map((systemA) => addSystemTitle(systemA, titles))
  return { ...result, systems: systemsA }
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
