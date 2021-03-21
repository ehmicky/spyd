import stringWidth from 'string-width'

import { getCombinationName } from '../title.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (titles, height, showStats) {
  const newlines = getNewlines(height, showStats)
  return `${newlines}${getCombinationTitle(titles, showStats)}`
}

const getNewlines = function (height, showStats) {
  const newlinesHeight =
    height - (showStats ? STATS_VERTICAL_SHIFT : NO_STATS_VERTICAL_SHIFT)
  return '\n'.repeat(newlinesHeight)
}

export const getTitleWidth = function ([{ titles }], showStats) {
  return stringWidth(getCombinationTitle(titles, showStats))
}

const getCombinationTitle = function (titles, showStats) {
  const padding = showStats ? STATS_PADDING : NO_STATS_PADDING
  return `${getCombinationName(titles)}${padding}`
}

const STATS_VERTICAL_SHIFT = 0
const STATS_PADDING_WIDTH = 1
const STATS_PADDING = ' '.repeat(STATS_PADDING_WIDTH)
const NO_STATS_VERTICAL_SHIFT = 1
const NO_STATS_PADDING_WIDTH = 2
const NO_STATS_PADDING = ' '.repeat(NO_STATS_PADDING_WIDTH)
