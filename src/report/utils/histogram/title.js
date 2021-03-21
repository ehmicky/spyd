import stringWidth from 'string-width'

import { getCombinationName } from '../title.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (titles, height) {
  const newlines = '\n'.repeat(height)
  return `${newlines}${getCombinationTitle(titles)}`
}

export const getTitleWidth = function ([{ titles }]) {
  return stringWidth(getCombinationTitle(titles))
}

const getCombinationTitle = function (titles) {
  return `${getCombinationName(titles)}${PADDING}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)
