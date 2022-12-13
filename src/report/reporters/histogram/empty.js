import { getCombTitleColorPad } from '../../utils/combination_title.js'

// Shown when a combination has not been measured yet
export const getEmptyCombination = (combination, height, mini) => {
  const histogramLines = getHistogramLines(height, mini)
  const labelsLines = getLabelsLines(mini)
  const combinationTitles = getCombTitleColorPad(combination)
  return `${histogramLines}${combinationTitles}\n${labelsLines}`
}

const getHistogramLines = (height, mini) => {
  const topNewlinesHeight = height - (mini ? ABSCISSA_BOTTOM_HEIGHT : 0)
  return '\n'.repeat(topNewlinesHeight)
}

// How many terminal lines the bottom line takes
const ABSCISSA_BOTTOM_HEIGHT = 1

const getLabelsLines = (mini) => {
  const bottomNewlinesHeight = mini ? 0 : ABSCISSA_LABELS_HEIGHT
  return '\n'.repeat(bottomNewlinesHeight)
}

// How many terminal lines the labels take
const ABSCISSA_LABELS_HEIGHT = 1
