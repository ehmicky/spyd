import stringWidth from 'string-width'

import { getScreenWidth } from '../../tty.js'

export const getHistograms = function (combinations) {
  return combinations.map(getHistogram)
}

const getHistogram = function ({ stats: { histogram, minPretty, maxPretty } }) {
  if (histogram === undefined) {
    return
  }

  const width = getScreenWidth()
  const frequencies = histogram.map(([, , frequency]) => frequency)
  const maxFrequency = Math.max(...frequencies)
  const rows = Array.from({ length: HISTOGRAM_HEIGHT }, (_, index) =>
    getHistogramRow(index, width),
  ).join('\n')
  const bottomLine = getBottomLine(width)
  const abscissa = getAbscissa({ minPretty, maxPretty, width })
  return `${rows}
${bottomLine}
${abscissa}`
}

const HISTOGRAM_HEIGHT = 8
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
const TICK_LEFT = '\u250C'
const TICK_MIDDLE = '\u252C'
const TICK_RIGHT = '\u2510'
const OUTSIDE_LEFT_PADDING = 1
const OUTSIDE_RIGHT_PADDING = 1
const CONTENT_LEFT_PADDING = 1
const CONTENT_RIGHT_PADDING = 1

const getHistogramRow = function (index, width) {
  const contentLeftPadding = ' '.repeat(CONTENT_LEFT_PADDING)
  const contentRightPadding = ' '.repeat(CONTENT_RIGHT_PADDING)
  const rowWidth =
    width -
    OUTSIDE_LEFT_PADDING -
    OUTSIDE_RIGHT_PADDING -
    CONTENT_LEFT_PADDING -
    CONTENT_RIGHT_PADDING
  const row = 'o'.repeat(rowWidth)
  return `${contentLeftPadding}${row}${contentRightPadding}`
}

const getBottomLine = function (width) {
  const mainLineWidth =
    width -
    TICK_LEFT.length -
    TICK_RIGHT.length -
    OUTSIDE_LEFT_PADDING -
    OUTSIDE_RIGHT_PADDING
  const mainLine = HORIZONTAL_LINE.repeat(mainLineWidth)
  return `${TICK_LEFT}${mainLine}${TICK_RIGHT}`
}

const getAbscissa = function ({ minPretty, maxPretty, width }) {
  const spacesWidth =
    width -
    stringWidth(minPretty) -
    stringWidth(maxPretty) -
    OUTSIDE_LEFT_PADDING -
    OUTSIDE_RIGHT_PADDING
  const spaces = ' '.repeat(spacesWidth)
  return `${minPretty}${spaces}${maxPretty}`
}
