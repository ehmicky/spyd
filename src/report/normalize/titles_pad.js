import { getCombinationsIds } from '../../combination/ids.js'
import { groupBy } from '../../utils/group.js'

// Add:
//  - `combination.task|runner|systemTitlePadded`: like
//     `combination.*Title` but padded so all combinations vertically align
//  - `combination.titles`: combines all *TitlePadded
export const padTitles = function (combinations) {
  const titleNames = getUniqueTitleNames(combinations)
  const paddings = getPaddings(combinations, titleNames)
  return combinations.map((combination) => addPadding(combination, paddings))
}

const getUniqueTitleNames = function (combinations) {
  const combinationsIds = getCombinationsIds(combinations)
  const titleNames = Object.entries(
    groupBy(combinationsIds, getDimensionTitleName),
  )
    .filter(shouldShowProp)
    .map(getTitleName)
  return titleNames.length === 0 ? DEFAULT_TITLE_NAMES : titleNames
}

const getDimensionTitleName = function ({ dimension: { titleName } }) {
  return titleName
}

const shouldShowProp = function ([, titleNames]) {
  return titleNames.length !== 1
}

const getTitleName = function ([titleName]) {
  return titleName
}

const DEFAULT_TITLE_NAMES = ['taskTitle']

const getPaddings = function (combinations, titleNames) {
  return titleNames.map((titleName) => getPadding(combinations, titleName))
}

const getPadding = function (combinations, titleName) {
  const lengths = combinations.map(({ [titleName]: value }) => value.length)
  const padding = Math.max(...lengths)
  return { titleName, padding }
}

const addPadding = function (combination, paddings) {
  const titles = paddings.map(({ titleName, padding }) =>
    padProp(combination[titleName], padding, titleName),
  )
  const titlesA = Object.fromEntries(titles)
  const titlesProp = Object.values(titlesA)
  return { ...combination, ...titlesA, titles: titlesProp }
}

const padProp = function (title, padding, titleName) {
  const titleA = title.padEnd(padding)
  return [`${titleName}${PADDED_PREFIX}`, titleA]
}

const PADDED_PREFIX = 'Padded'
