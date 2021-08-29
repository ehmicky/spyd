import { serializeHistograms } from '../utils/histogram/main.js'
import { addTitles } from '../utils/title.js'

// Reporter showing distribution of measures with a histogram
const reportTerminal = function ({ combinations, screenWidth }) {
  const combinationsA = addTitles(combinations)
  const histograms = serializeHistograms(combinationsA, {
    showStats: true,
    screenWidth,
  })
  return histograms
}

export const histogram = { reportTerminal }
