import { serializeHistograms } from '../utils/histogram/main.js'

// Reporter showing distribution of measures with a histogram
const reportTerminal = function ({ combinations, screenWidth }) {
  return serializeHistograms(combinations, { mini: false, screenWidth })
}

export const histogram = { reportTerminal }
