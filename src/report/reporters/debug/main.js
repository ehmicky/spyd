import { getFooter } from '../../utils/footer/main.js'
import { serializeHistograms } from '../../utils/histogram/main.js'
import { joinSections } from '../../utils/join.js'
import { prettifyValue } from '../../utils/prettify_value.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { getCombinationName, addTitles } from '../../utils/title.js'

import { getCells } from './cell.js'
import { getHeader } from './header.js'

// Debugging reporter only meant for development purpose
const report = function ({ id, timestamp, systems, combinations }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const table = getTable(combinationsB)
  const histograms = serializeHistograms(combinationsB, HISTOGRAM_OPTS)
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([table, ...histograms, footer])
}

const getTable = function (combinations) {
  const header = getHeader(combinations[0])
  const rows = combinations.map(getRow)
  return [header, ...rows].join('\n')
}

// Retrieve a single row, including the row name
const getRow = function ({ titles, stats }) {
  const combinationName = getCombinationName(titles)
  const statsStr = getCells(stats)
  return `${combinationName}  ${statsStr}`
}

const HISTOGRAM_OPTS = { showStats: false }

export const debug = { report }
