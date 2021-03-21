import { serializeHistograms } from '../utils/histogram/main.js'
import { joinSections } from '../utils/join.js'
import { prettifyStats } from '../utils/stats/main.js'
import { addTitles } from '../utils/title.js'

// Reporter showing distribution of measures with a histogram
const report = function ({ combinations }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)
  const histograms = serializeHistograms(combinationsB, HISTOGRAM_OPTS)
  return joinSections(histograms)
}

const HISTOGRAM_OPTS = { height: 2, showStats: true }

export const histogram = { report }
