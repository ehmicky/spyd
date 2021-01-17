import { COMBINATION_CATEGORIES } from '../select/ids.js'

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
