import { serializeHistograms } from '../../utils/histogram/main.js'

import { getStatsTables } from './stats.js'

// Debugging reporter only meant for development purpose
const reportTerminal = function ({ combinations, screenWidth }) {
  const statsTables = getStatsTables(combinations, screenWidth)
  const histograms = serializeHistograms(combinations, {
    mini: true,
    screenWidth,
  })
  return `${statsTables}\n\n${histograms}`
}

export const debug = { reportTerminal, capabilities: { debugStats: true } }
