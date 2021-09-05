import { serializeHistograms } from '../../utils/histogram/main.js'

import { getStatsTables } from './stats.js'
import { getTimeSeries } from './time_series.js'

// Debugging reporter only meant for development purpose
const reportTerminal = function ({ combinations, screenWidth, history }) {
  const statsTables = getStatsTables(combinations, screenWidth)
  const timeSeries = getTimeSeries(history, combinations, screenWidth)
  const histograms = serializeHistograms(combinations, {
    mini: true,
    screenWidth,
  })
  return [statsTables, timeSeries, histograms].join('\n\n')
}

export const debug = {
  reportTerminal,
  capabilities: { debugStats: true, history: true },
}
