import { serializeHistograms } from '../../utils/histogram/main.js'
import { addTitles } from '../../utils/title.js'

import { getStatsTables } from './stats.js'
import { getTimeSeries } from './time_series.js'

// Debugging reporter only meant for development purpose
const reportTerminal = function ({ combinations, screenWidth, history }) {
  const combinationsA = addTitles(combinations)

  const statsTables = getStatsTables(combinationsA, screenWidth)
  const timeSeries = getTimeSeries(history, combinationsA, screenWidth)
  const histograms = serializeHistograms(combinationsA, {
    showStats: false,
    screenWidth,
  })
  return [statsTables, timeSeries, histograms].join('\n\n')
}

export const debug = {
  reportTerminal,
  capabilities: { debugStats: true, history: true },
}
