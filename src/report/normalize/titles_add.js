import { getCombDimensions } from '../../combination/dimensions.js'
import { mapValues } from '../../utils/map.js'

import { padTitles } from './titles_pad.js'

// Add `result.combinations[*].dimensions[*].title`
export const addCombinationsTitles = (result, titles) => {
  const combinations = result.combinations.map((combination) =>
    addCombinationTitles(combination, titles),
  )
  const combinationsA = padTitles(combinations)
  return { ...result, combinations: combinationsA }
}

const addCombinationTitles = (combination, titles) => {
  const titlesA = combination.config.showTitles ? titles : {}
  const dimensions = getCombDimensions(combination)
  return dimensions.reduce(
    (combinationA, dimension) =>
      addCombinationTitle({
        combination: combinationA,
        dimension,
        titles: titlesA,
      }),
    combination,
  )
}

const addCombinationTitle = ({
  combination,
  combination: { dimensions },
  dimension: { propName },
  titles,
}) => {
  const dimension = addTitle(dimensions[propName], titles)
  return {
    ...combination,
    dimensions: { ...dimensions, [propName]: dimension },
  }
}

// Add `footer.systems[*].dimensions[*].title`
export const addFooterTitles = (footer, titles, showTitles) => {
  const titlesA = showTitles ? titles : {}
  const systems = footer.systems.map((system) =>
    addSystemTitles(system, titlesA),
  )
  return { ...footer, systems }
}

const addSystemTitles = (system, titles) => {
  const dimensionsA = system.dimensions.map((dimensions) =>
    addDimensionsTitles(dimensions, titles),
  )
  return { ...system, dimensions: dimensionsA }
}

const addDimensionsTitles = (dimensions, titles) =>
  mapValues(dimensions, (dimensionValueArray) =>
    addDimensionTitles(dimensionValueArray, titles),
  )

const addDimensionTitles = (dimensionValueArray, titles) =>
  dimensionValueArray.map((id) => addTitle({ id }, titles))

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
const addTitle = (obj, titles) => {
  const { id } = obj
  const { [id]: title = id } = titles
  return title === undefined ? obj : { ...obj, title }
}

export const DEFAULT_TITLES = {}
export const EXAMPLE_TITLES = { taskId: 'Task title', runnerId: 'Runner title' }
export const EXAMPLE_TITLE = 'Task title'

export const DEFAULT_SHOW_TITLES = false
