import { getFooter } from '../../utils/footer/main.js'
import { serializeHistograms } from '../../utils/histogram/main.js'
import { joinSections } from '../../utils/join.js'
import { prettifyValue } from '../../utils/prettify_value.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { addTitles } from '../../utils/title.js'

import { getColumnWidth, getAllColumns } from './columns.js'
import { getHeader } from './header.js'
import { getRow } from './row.js'
import { getTimeSeries } from './time_series.js'

// Debugging reporter only meant for development purpose
const report = function ({
  id,
  timestamp,
  systems,
  combinations,
  screenWidth,
  history,
}) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const tables = getTables(combinationsB, screenWidth)
  const timeSeries = getTimeSeries(history, combinationsB, screenWidth)
  const histograms = serializeHistograms(combinationsB, {
    showStats: false,
    screenWidth,
  })
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([...tables, ...timeSeries, ...histograms, footer])
}

const getTables = function (combinations, screenWidth) {
  const columnWidth = getColumnWidth(combinations)
  const allColumns = getAllColumns(combinations, screenWidth, columnWidth)
  return allColumns.map((columns) =>
    getTable(combinations, columns, columnWidth),
  )
}

const getTable = function (combinations, columns, columnWidth) {
  const header = getHeader(combinations, columns, columnWidth)
  const rows = combinations.map((combination) =>
    getRow(combination, columns, columnWidth),
  )
  return [header, ...rows].join('\n')
}

export const debug = { report }
