import stringWidth from 'string-width'

import { titleColor, separatorColor, fieldColor } from '../utils/colors.js'
import { getFooter } from '../utils/footer/main.js'
import { getHistograms } from '../utils/histogram/main.js'
import { joinSections } from '../utils/join.js'
import { padStart } from '../utils/padding.js'
import { prettifyValue } from '../utils/prettify_value.js'
import { SEPARATOR_SIGN } from '../utils/separator.js'
import { STAT_TITLES } from '../utils/stat_titles.js'
import { prettifyStats } from '../utils/stats/main.js'
import { addTitles } from '../utils/title/main.js'

// Debugging reporter only meant for development purpose
const report = function ({ id, timestamp, systems, combinations }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const table = getTable(combinationsB)
  const histograms = getHistograms(combinationsB)
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([table, ...histograms, footer])
}

const getTable = function (combinations) {
  const header = getHeader(combinations[0])
  const rows = combinations.map(getRow)
  return [header, ...rows].join('\n')
}

const getHeader = function ({ row, stats }) {
  const rowName = getRowName(row)
  const nameSpace = ''.padStart(rowName.length)
  const headerCells = STATS.map((name) => getHeaderCell(stats, name)).join(
    CELL_SEPARATOR,
  )
  return `${titleColor(`${nameSpace} ${SEPARATOR_SIGN}`)} ${headerCells}`
}

const getHeaderCell = function (stats, name) {
  const cell = getCell(stats, name)
  const headerName = STAT_TITLES[name].padStart(stringWidth(cell))
  return `${fieldColor(headerName)}`
}

const getRow = function ({ row, stats }) {
  const rowName = getRowName(row)
  const statsStr = getCells(stats)
  return `${titleColor(`${rowName} ${SEPARATOR_SIGN}`)} ${statsStr}`
}

const getRowName = function (row) {
  return row.join(SEPARATOR)
}

export const getCells = function (stats) {
  return STATS.map((name) => getCell(stats, name)).join(CELL_SEPARATOR)
}

const getCell = function (stats, name) {
  const stat = stats[`${name}Pretty`]
  const headerLength = STAT_TITLES[name].length
  const padSize = Math.max(headerLength, stringWidth(stat))

  const statA = padStart(stat, padSize)
  return statA
}

const SEPARATOR = ` ${SEPARATOR_SIGN} `
const CELL_SEPARATOR = separatorColor(SEPARATOR)

const STATS = [
  'median',
  'mean',
  'min',
  'low',
  'high',
  'max',
  'diff',
  'deviation',
  'times',
  'loops',
  'repeat',
  'samples',
  'minLoopDuration',
]

export const dev = { report }
