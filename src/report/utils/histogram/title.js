import stringWidth from 'string-width'

import { getCombinationNameColor } from '../name.js'
import { NAME_SEPARATOR_COLORED } from '../separator.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (combination, height, showStats) {
  const newlines = getNewlines(height, showStats)
  return `${newlines}${getTitleBlockContents(combination)}`
}

export const getTitleBlockWidth = function ([combination]) {
  return stringWidth(getTitleBlockContents(combination))
}

const getTitleBlockContents = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

const getNewlines = function (height, showStats) {
  const newlinesHeight =
    height - (showStats ? STATS_VERTICAL_SHIFT : NO_STATS_VERTICAL_SHIFT)
  return '\n'.repeat(newlinesHeight)
}

const STATS_VERTICAL_SHIFT = 0
const NO_STATS_VERTICAL_SHIFT = 1
