import stringWidth from 'string-width'

import { getCombinationNameColor } from '../name.js'
import { NAME_SEPARATOR_COLORED } from '../separator.js'

import { ABSCISSA_BOTTOM_HEIGHT, ABSCISSA_LABELS_HEIGHT } from './abscissa.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (combination, height, mini) {
  const topNewlines = getTopNewlines(height, mini)
  const bottomNewlines = getBottomNewlines(mini)
  const titleBlockContents = getTitleBlockContents(combination)
  return `${topNewlines}${titleBlockContents}\n${bottomNewlines}`
}

export const getTitleBlockWidth = function ([combination]) {
  return stringWidth(getTitleBlockContents(combination))
}

const getTitleBlockContents = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

const getTopNewlines = function (height, mini) {
  const topNewlinesHeight = height - (mini ? ABSCISSA_BOTTOM_HEIGHT : 0)
  return '\n'.repeat(topNewlinesHeight)
}

const getBottomNewlines = function (mini) {
  const bottomNewlinesHeight = mini ? 0 : ABSCISSA_LABELS_HEIGHT
  return '\n'.repeat(bottomNewlinesHeight)
}
