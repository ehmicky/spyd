import { serializeHistograms } from '../../utils/histogram/main.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { addTitles } from '../../utils/title.js'

import { getStatTables } from './stats.js'
import { getTimeSeries } from './time_series.js'

// Debugging reporter only meant for development purpose
const reportTerminal = function ({ combinations, screenWidth, history }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const tables = getStatTables(combinationsB, screenWidth)
  const timeSeries = getTimeSeries(history, combinationsB, screenWidth)
  const histograms = serializeHistograms(combinationsB, {
    showStats: false,
    screenWidth,
  })
  return [tables, timeSeries, histograms].join('\n\n')
}

export const debug = { reportTerminal, debugStats: true }
