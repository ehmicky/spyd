import { serializeHistograms } from '../utils/histogram/main.js'
import { prettifyStats } from '../utils/stats/main.js'
import { addTitles } from '../utils/title.js'

// Reporter showing distribution of measures with a histogram
const reportTerminal = function ({ combinations, screenWidth }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)
  const histograms = serializeHistograms(combinationsB, {
    showStats: true,
    screenWidth,
  })
  return histograms
}

export const histogram = { reportTerminal }
