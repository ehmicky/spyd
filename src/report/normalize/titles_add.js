import { getCombinationIds } from '../../combination/ids.js'

import { padTitles } from './titles_pad.js'

// Add `result.combinations[*].taskTitle|...`
export const addCombinationsTitles = function (result, titles, showTitles) {
  const titlesA = showTitles ? titles : {}
  const combinations = result.combinations.map((combination) =>
    addCombinationTitles(combination, titlesA),
  )
  const combinationsA = padTitles(combinations)
  return { ...result, combinations: combinationsA }
}

const addCombinationTitles = function (combination, titles) {
  const combinationIds = getCombinationIds(combination)
  return combinationIds.reduce(
    (combinationA, { dimension }) =>
      addCombinationTitle({ combination: combinationA, dimension, titles }),
    combination,
  )
}

const addCombinationTitle = function ({
  combination,
  combination: { dimensions },
  dimension: { propName, titleName },
  titles,
}) {
  const dimension = addTitle(dimensions[propName], { titleName, titles })
  return {
    ...combination,
    dimensions: { ...dimensions, [propName]: dimension },
  }
}

// Add `footer.systems[*].title`
export const addFooterTitles = function (footer, titles, showTitles) {
  const titlesA = showTitles ? titles : {}
  const systems = footer.systems.map((system) =>
    addTitle(system, { titleName: 'title', titles: titlesA }),
  )
  return { ...footer, systems }
}

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
const addTitle = function (obj, { titleName, titles }) {
  const { id } = obj
  const { [id]: title = id } = titles
  return title === undefined ? obj : { ...obj, [titleName]: title }
}
