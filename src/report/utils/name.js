import { titleColor } from './colors.js'

// Retrieve the width of the combination name's column
export const getCombinationNameWidth = function (combination) {
  return getCombinationNamePadded(combination).length
}

// Retrieve the prettified combination name to used as a first column
export const getCombinationNameColor = function (combination) {
  return titleColor(getCombinationNamePadded(combination))
}

export const getCombinationNamePadded = function ({ titles }) {
  const combinationName = getCombinationName(titles)
  return `${combinationName}${NAME_PADDING}`
}

const NAME_PADDING_WIDTH = 2
const NAME_PADDING = ' '.repeat(NAME_PADDING_WIDTH)

// Combine titles into a single to display for a given combination
const getCombinationName = function (titles) {
  const rowName = titles.join(NAME_MIDDLE_SEPARATOR)
  return `${NAME_LEFT_SEPARATOR}${rowName}${NAME_RIGHT_SEPARATOR}`
}

const NAME_MIDDLE_SEPARATOR = ' '
const NAME_LEFT_SEPARATOR = '[ '
const NAME_RIGHT_SEPARATOR = ' ]'
