import { serializeHistograms } from '../utils/histogram/main.js'
import { joinBigSections } from '../utils/join.js'
import { prettifyStats } from '../utils/stats/main.js'
import { addTitles } from '../utils/title.js'

// Reporter showing distribution of measures with a histogram
const report = function ({ combinations }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)
  const histograms = serializeHistograms(combinationsB)
  return joinBigSections(histograms)
}

export const histogram = { report }
