import { titleColor } from './colors.js'
import { NAME_SEPARATOR, NAME_SEPARATOR_COLORED } from './separator.js'

// Retrieve a combination's name with padding and color
export const getCombNamePaddedColor = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

// Retrieve a combination's name with padding
export const getCombinationPaddedName = function (combination) {
  return `${getCombinationName(combination)}${NAME_SEPARATOR}`
}

// Retrieve the prettified combination name to used as a first column
export const getCombinationNameColor = function (combination) {
  const combinationName = getCombinationName(combination)
  return titleColor(combinationName)
}

export const getCombinationName = function ({ titles }) {
  const rowName = titles.join(NAME_MIDDLE)
  return `${NAME_START}${rowName}${NAME_END}`
}

const NAME_MIDDLE = ' '
const NAME_START = '[ '
const NAME_END = ' ]'
