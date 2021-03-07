import stringWidth from 'string-width'

import { getScreenWidth } from '../tty.js'
import { titleColor, separatorColor, fieldColor } from '../utils/colors.js'
import { getFooter } from '../utils/footer/main.js'
import { joinSections } from '../utils/join.js'
import { padStart } from '../utils/padding.js'
import { prettifyValue } from '../utils/prettify_value.js'
import { SEPARATOR_SIGN } from '../utils/separator.js'
import { STAT_TITLES } from '../utils/stat_titles.js'
import { getDecimals } from '../utils/stats/decimals.js'
import { prettifyStats } from '../utils/stats/main.js'
import { scalePercentage } from '../utils/stats/percentage.js'
import { addTitles } from '../utils/title/main.js'

// Debugging reporter only meant for development purpose
const report = function ({ id, timestamp, systems, combinations }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const table = getTable(combinationsB)
  const histograms = getHistograms(combinationsB)
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([table, histograms, footer])
}

const getHistograms = function (combinationsB) {
  return combinationsB.map(getHistogram).join('\n\n')
}

const getHistogram = function ({ stats: { histogram, minPretty, maxPretty } }) {
  if (histogram === undefined) {
    return ''
  }

  const width = getScreenWidth()

  const frequencies = histogram.map(([, , frequency]) => frequency)
  const maxFrequency = scalePercentage(Math.max(...frequencies))
  const frequencyDecimals = getDecimals(maxFrequency)
  const maxFrequencyPretty = `${maxFrequency.toFixed(frequencyDecimals)}%`
  const ordinateWidth = maxFrequencyPretty.length
  const rows = Array.from({ length: HISTOGRAM_HEIGHT }, (_, index) =>
    getHistogramRow({ index, ordinateWidth, width, maxFrequencyPretty }),
  ).join('\n')
  const bottomLine = getBottomLine(ordinateWidth, width)
  const abscissa = getAbscissa({ minPretty, maxPretty, width, ordinateWidth })
  return `${rows}
${bottomLine}
${abscissa}`
}

const HISTOGRAM_HEIGHT = 8
const MIN_FREQUENCY_PRETTY = '0%'
const HISTOGRAM_CHARS = [
  ' ',
  '\u2581',
  '\u2582',
  '\u2583',
  '\u2584',
  '\u2585',
  '\u2586',
  '\u2587',
  '\u2588',
]
const HORIZONTAL_LINE = '\u2500'
const VERTICAL_LINE = '\u2502'
const HORIZONTAL_UP_LINE = '\u2534'
const OUTSIDE_LEFT_PADDING = 1
const OUTSIDE_RIGHT_PADDING = 1
const ORDINATE_LEFT_PADDING = 1
const ORDINATE_RIGHT_PADDING = 1
const CONTENT_LEFT_PADDING = 1
const CONTENT_RIGHT_PADDING = 1
const ORDINATE_SEPARATOR = VERTICAL_LINE

const getHistogramRow = function ({
  index,
  ordinateWidth,
  width,
  maxFrequencyPretty,
}) {
  const ordinate = getOrdinate(index, maxFrequencyPretty).padStart(
    ordinateWidth,
  )
  const ordinateLeftPadding = ' '.repeat(ORDINATE_LEFT_PADDING)
  const ordinateRightPadding = ' '.repeat(ORDINATE_RIGHT_PADDING)
  const contentLeftPadding = ' '.repeat(CONTENT_LEFT_PADDING)
  const contentRightPadding = ' '.repeat(CONTENT_RIGHT_PADDING)
  const rowWidth =
    width -
    ordinateWidth -
    OUTSIDE_LEFT_PADDING -
    OUTSIDE_RIGHT_PADDING -
    ORDINATE_LEFT_PADDING -
    ORDINATE_RIGHT_PADDING -
    ORDINATE_SEPARATOR.length -
    CONTENT_LEFT_PADDING -
    CONTENT_RIGHT_PADDING
  const row = 'o'.repeat(rowWidth)
  return `${ordinateLeftPadding}${ordinate}${ordinateRightPadding}${ORDINATE_SEPARATOR}${contentLeftPadding}${row}${contentRightPadding}`
}

const getOrdinate = function (index, maxFrequencyPretty) {
  if (index === 0) {
    return maxFrequencyPretty
  }

  if (index === HISTOGRAM_HEIGHT - 1) {
    return MIN_FREQUENCY_PRETTY
  }

  return ''
}

const getBottomLine = function (ordinateWidth, width) {
  const ordinateLineWidth =
    ordinateWidth + ORDINATE_LEFT_PADDING + ORDINATE_RIGHT_PADDING
  const ordinateLine = HORIZONTAL_LINE.repeat(ordinateLineWidth)
  const mainLineWidth =
    width -
    ordinateWidth -
    OUTSIDE_LEFT_PADDING -
    OUTSIDE_RIGHT_PADDING -
    ORDINATE_SEPARATOR.length -
    CONTENT_LEFT_PADDING -
    CONTENT_RIGHT_PADDING
  const mainLine = HORIZONTAL_LINE.repeat(mainLineWidth)
  return `${ordinateLine}${HORIZONTAL_UP_LINE}${mainLine}`
}

const getAbscissa = function ({ minPretty, maxPretty, width, ordinateWidth }) {
  const ordinate = ' '.repeat(
    ordinateWidth + ORDINATE_LEFT_PADDING + ORDINATE_RIGHT_PADDING,
  )
  const spaces = ' '.repeat(
    width -
      ordinateWidth -
      stringWidth(minPretty) -
      stringWidth(maxPretty) -
      OUTSIDE_LEFT_PADDING -
      OUTSIDE_RIGHT_PADDING -
      ORDINATE_SEPARATOR.length -
      CONTENT_LEFT_PADDING -
      CONTENT_RIGHT_PADDING -
      1,
  )
  return `${ordinate} ${minPretty}${spaces}${maxPretty}`
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
  const padSize = Math.max(COLUMN_MIN_SIZE, headerLength, stringWidth(stat))

  const statA = padStart(stat, padSize)
  return statA
}

const COLUMN_MIN_SIZE = 7
const SEPARATOR = ` ${SEPARATOR_SIGN} `
const CELL_SEPARATOR = separatorColor(SEPARATOR)

const STATS = [
  'median',
  'mean',
  'min',
  'max',
  'diff',
  'deviation',
  'times',
  'loops',
  'repeat',
  'samples',
  'minLoopDuration',
]

export const debug = { report }
