import { titleColor } from './colors.js'

// Retrieve the prettified combination name to used as a first column
export const getCombinationNameColor = function ({ titles }) {
  const rowName = titles.join(NAME_MIDDLE)
  return titleColor(`${NAME_START}${rowName}${NAME_END}`)
}

const NAME_MIDDLE = ' '
const NAME_START = '[ '
const NAME_END = ' ]'
