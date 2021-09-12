import { getCombinationsIds, getDimensionTitle } from '../../combination/ids.js'
import { groupBy } from '../../utils/group.js'

// Add:
//  - `combination.task|runner|systemTitlePadded`: like
//     `combination.*Title` but padded so all combinations vertically align
//  - `combination.titles`: combines all *TitlePadded
export const padTitles = function (combinations) {
  const dimensions = getDimensions(combinations)
  const paddings = getPaddings(combinations, dimensions)
  return combinations.map((combination) => addPadding(combination, paddings))
}

const getDimensions = function (combinations) {
  const combinationsIds = getCombinationsIds(combinations)
  const dimensions = Object.entries(
    groupBy(combinationsIds, getDimensionPropName),
  )
    .filter(shouldShowProp)
    .map(getDimension)
  return dimensions.length === 0 ? DEFAULT_DIMENSIONS : dimensions
}

const getDimensionPropName = function ({ dimension: { propName } }) {
  return propName
}

const shouldShowProp = function ([, combinationsIds]) {
  return combinationsIds.length !== 1
}

const getDimension = function ([dimension]) {
  return dimension
}

const DEFAULT_DIMENSIONS = ['task']

const getPaddings = function (combinations, dimensions) {
  return dimensions.map((dimension) => getPadding(combinations, dimension))
}

const getPadding = function (combinations, dimension) {
  const lengths = combinations.map(
    (combination) => getDimensionTitle(dimension, combination).length,
  )
  const padding = Math.max(...lengths)
  return { dimension, padding }
}

const addPadding = function (combination, paddings) {
  const titles = paddings.map(({ dimension, padding }) =>
    padProp(combination, dimension, padding),
  )
  const titlesA = Object.fromEntries(titles)
  const titlesProp = Object.values(titlesA)
  return { ...combination, ...titlesA, titles: titlesProp }
}

const padProp = function (combination, dimension, padding) {
  const title = getDimensionTitle(dimension, combination)
  const titleA = title.padEnd(padding)
  return [`${dimension}${PADDED_PREFIX}`, titleA]
}

const PADDED_PREFIX = 'TitlePadded'
