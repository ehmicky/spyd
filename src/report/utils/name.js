import { titleColor } from './colors.js'

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
