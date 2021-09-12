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
export const addCombinationsTitles = function (result, titles, showTitles) {
  const titlesA = showTitles ? titles : {}
  const combinations = result.combinations.map((combination) =>
    addCombinationTitles(combination, titlesA),
  )
  return { ...result, combinations }
}

const addCombinationTitles = function (combination, titles) {
  return COMBINATION_DIMENSIONS.reduce(
    (combinationA, { idName, titleName }) =>
      addTitle(combinationA, { idName, titleName, titles }),
    combination,
  )
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
  return addTitle(system, { idName: 'id', titleName: 'title', titles })
}

const addTitle = function (obj, { idName, titleName, titles }) {
  const id = obj[idName]
  const { [id]: title = id } = titles
  return title === undefined ? obj : { ...obj, [titleName]: title }
}
