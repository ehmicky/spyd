import { titleColor } from './colors.js'
import { TITLE_SEPARATOR, TITLE_SEPARATOR_COLORED } from './separator.js'

// Retrieve a combination's title with padding and color
export const getCombTitleColorPad = function (combination) {
  return `${getCombinationTitleColor(combination)}${TITLE_SEPARATOR_COLORED}`
}

// Retrieve a combination's title with padding
export const getCombinationTitlePad = function (combination) {
  return `${getCombinationTitle(combination)}${TITLE_SEPARATOR}`
}

// Retrieve the prettified combination title to used as a first column
export const getCombinationTitleColor = function (combination) {
  return titleColor(getCombinationTitle(combination))
}

const getCombinationTitle = function ({ dimensions }) {
  const combinationTitle = Object.values(dimensions)
    .map(getTitlePadded)
    .join(COMBINATION_TITLE_MIDDLE)
  return `${COMBINATION_TITLE_START}${combinationTitle}${COMBINATION_TITLE_END}`
}

const getTitlePadded = function ({ titlePadded }) {
  return titlePadded
}

const COMBINATION_TITLE_START = '[ '
const COMBINATION_TITLE_END = ' ]'
const COMBINATION_TITLE_MIDDLE = ' | '
