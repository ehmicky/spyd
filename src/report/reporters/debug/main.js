import { serializeHistograms } from '../../utils/histogram/main.js'
import { joinSections } from '../../utils/join.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { addTitles } from '../../utils/title.js'

import { getColumns, getColumnWidth, getAllColumns } from './columns.js'
import { getHeader } from './header.js'
import { getRow } from './row.js'
import { getTimeSeries } from './time_series.js'

// Debugging reporter only meant for development purpose
const reportTerminal = function ({ combinations, screenWidth, history }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const tables = getTables(combinationsB, screenWidth)
  const timeSeries = getTimeSeries(history, combinationsB, screenWidth)
  const histograms = serializeHistograms(combinationsB, {
    showStats: false,
    screenWidth,
  })
  return joinSections([...tables, ...timeSeries, ...histograms])
}

const getTables = function (combinations, screenWidth) {
  const columns = getColumns(combinations)

  if (columns.length === 0) {
    return getEmptyTables(combinations)
  }

  const columnWidth = getColumnWidth(combinations, columns)
  const allColumns = getAllColumns({
    combinations,
    columns,
    screenWidth,
    columnWidth,
  })
  return allColumns.map((columnsA) =>
    getTable(combinations, columnsA, columnWidth),
  )
}

// When no stats are available, we show all possible stats as empty columns.
const getEmptyTables = function (combinations) {
  const rows = getRows(combinations, [], 0)
  const table = `${NON_TRIMMABLE_SPACE}\n${rows}`
  return [table]
}

// Keep space for the header to avoid jitter due to trimming, while still
const NON_TRIMMABLE_SPACE = '\u200B'

const getTable = function (combinations, columns, columnWidth) {
  const header = getHeader(combinations, columns, columnWidth)
  const rows = getRows(combinations, columns, columnWidth)
  return `${header}\n${rows}`
}

const getRows = function (combinations, columns, columnWidth) {
  return combinations
    .map((combination) => getRow(combination, columns, columnWidth))
    .join('\n')
}

export const debug = { reportTerminal, debugStats: true }
