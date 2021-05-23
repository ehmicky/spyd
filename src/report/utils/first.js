import { titleColor } from './colors.js'
import { getCombinationName } from './title.js'

export const getCombinationNameWidth = function (combination) {
  return getCombinationNamePadded(combination).length
}

export const getCombinationNameColor = function (combination) {
  return titleColor(getCombinationNamePadded(combination))
}

const getCombinationNamePadded = function ({ titles }) {
  const combinationName = getCombinationName(titles)
  return `${combinationName}${NAME_PADDING}`
}

const NAME_PADDING_WIDTH = 2
const NAME_PADDING = ' '.repeat(NAME_PADDING_WIDTH)
