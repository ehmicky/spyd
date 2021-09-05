import { getCombNamePaddedColor } from '../../utils/name.js'

import { ABSCISSA_BOTTOM_HEIGHT, ABSCISSA_LABELS_HEIGHT } from './abscissa.js'

// Shown when there is the combination has not been measured yet
export const getEmptyCombination = function (combination, height, mini) {
  const histogramLines = getHistogramLines(height, mini)
  const labelsLines = getLabelsLines(mini)
  const combinationTitles = getCombNamePaddedColor(combination)
  return `${histogramLines}${combinationTitles}\n${labelsLines}`
}

const getHistogramLines = function (height, mini) {
  const topNewlinesHeight = height - (mini ? ABSCISSA_BOTTOM_HEIGHT : 0)
  return '\n'.repeat(topNewlinesHeight)
}

const getLabelsLines = function (mini) {
  const bottomNewlinesHeight = mini ? 0 : ABSCISSA_LABELS_HEIGHT
  return '\n'.repeat(bottomNewlinesHeight)
}
