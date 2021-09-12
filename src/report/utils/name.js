import { titleColor } from './colors.js'
import { NAME_SEPARATOR, NAME_SEPARATOR_COLORED } from './separator.js'

// Retrieve a combination's title with padding and color
export const getCombTitleColorPad = function (combination) {
  return `${getCombinationTitleColor(combination)}${NAME_SEPARATOR_COLORED}`
}

// Retrieve a combination's title with padding
export const getCombinationTitlePad = function (combination) {
  return `${getCombinationTitle(combination)}${NAME_SEPARATOR}`
}

// Retrieve the prettified combination title to used as a first column
export const getCombinationTitleColor = function (combination) {
  return titleColor(getCombinationTitle(combination))
}

const getCombinationTitle = function ({ dimensions }) {
  const combinationTitle = Object.values(dimensions)
    .map(getTitlePadded)
    .join(NAME_MIDDLE)
  return `${NAME_START}${combinationTitle}${NAME_END}`
}

const getTitlePadded = function ({ titlePadded }) {
  return titlePadded
}

const NAME_MIDDLE = ' | '
const NAME_START = '[ '
const NAME_END = ' ]'
