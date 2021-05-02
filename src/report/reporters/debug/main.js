import { getFooter } from '../../utils/footer/main.js'
import { serializeHistograms } from '../../utils/histogram/main.js'
import { joinSections } from '../../utils/join.js'
import { prettifyValue } from '../../utils/prettify_value.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { addTitles } from '../../utils/title.js'

import { getAllColumns } from './columns.js'
import { getHeader } from './header.js'
import { getRow } from './row.js'

// Debugging reporter only meant for development purpose
const report = function ({
  id,
  timestamp,
  systems,
  combinations,
  screenWidth,
}) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const tables = getTables(combinationsB, screenWidth)
  const histograms = serializeHistograms(combinationsB, HISTOGRAM_OPTS)
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([...tables, ...histograms, footer])
}

const getTables = function (combinations, screenWidth) {
  const allColumns = getAllColumns(combinations[0], screenWidth)
  return allColumns.map((columns) => getTable(combinations, columns))
}

const getTable = function (combinations, columns) {
  const header = getHeader(combinations[0], columns)
  const rows = combinations.map((combination) => getRow(combination, columns))
  return [header, ...rows].join('\n')
}

const HISTOGRAM_OPTS = { showStats: false }

export const debug = { report }
