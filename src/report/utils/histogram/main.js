/* eslint-disable max-lines, max-statements */
import stringWidth from 'string-width'

import { getScreenWidth } from '../../tty.js'

import { resizeHistogram } from './resize.js'

export const getHistograms = function (combinations) {
  return combinations.map(getHistogram)
}

const getHistogram = function ({
  stats: { histogram, low, lowPretty, median, medianPretty, high, highPretty },
}) {
  if (histogram === undefined) {
    return
  }

  // TODO: compute both *Pretty and *Padded so this is not needed
  const lowPrettyA = lowPretty.trim()
  const medianPrettyA = medianPretty.trim()
  const highPrettyA = highPretty.trim()

  const width = getScreenWidth() - OUTSIDE_LEFT_PADDING - OUTSIDE_RIGHT_PADDING
  const contentWidth = width - CONTENT_LEFT_PADDING - CONTENT_RIGHT_PADDING
  const columns = getHistogramColumns(histogram, contentWidth)
  const medianPercentage = (median - low) / (high - low)
  const medianIndex =
    Math.round((contentWidth - 1) * medianPercentage) + CONTENT_LEFT_PADDING

  const rows = Array.from({ length: HISTOGRAM_HEIGHT }, (_, index) =>
    getHistogramRow(index, columns),
  ).join('\n')
  const bottomLine = getBottomLine(width, medianIndex)
  const abscissa = getAbscissa({
    lowPretty: lowPrettyA,
    highPretty: highPrettyA,
    width,
    medianIndex,
    medianPretty: medianPrettyA,
  })
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
const [EMPTY_HISTOGRAM_CHAR] = HISTOGRAM_CHARS
const FULL_HISTOGRAM_CHAR = HISTOGRAM_CHARS[HISTOGRAM_CHARS.length - 1]
const HORIZONTAL_LINE = '\u2500'
const TICK_LEFT = '\u250C'
const TICK_MIDDLE = '\u252C'
const TICK_RIGHT = '\u2510'
const OUTSIDE_LEFT_PADDING = 1
const OUTSIDE_RIGHT_PADDING = 1
const CONTENT_LEFT_PADDING = 1
const CONTENT_RIGHT_PADDING = 1
const MEDIAN_PADDING = 1

const getHistogramColumns = function (histogram, contentWidth) {
  const frequencies = histogram.map(getFrequency)
  const frequenciesA = resizeHistogram(frequencies, contentWidth)
  const maxFrequency = Math.max(...frequenciesA)
  const columns = frequenciesA.map((frequency) =>
    getHistogramColumn(frequency, maxFrequency),
  )
  return columns
}

const getFrequency = function ([, , frequency]) {
  return frequency
}

const getHistogramColumn = function (frequency, maxFrequency) {
  const height = (HISTOGRAM_HEIGHT * frequency) / maxFrequency
  const heightLevel = Math.floor(height)
  const charIndex = Math.ceil(
    (height - heightLevel) * (HISTOGRAM_CHARS.length - 1),
  )
  return [heightLevel, charIndex]
}

const getHistogramRow = function (index, columns) {
  const contentLeftPadding = ' '.repeat(CONTENT_LEFT_PADDING)
  const contentRightPadding = ' '.repeat(CONTENT_RIGHT_PADDING)
  const row = columns
    .map(([heightLevel, charIndex]) =>
      getHistogramCell(heightLevel, charIndex, index),
    )
    .join('')
  return `${contentLeftPadding}${row}${contentRightPadding}`
}

const getHistogramCell = function (heightLevel, charIndex, index) {
  const inverseIndex = HISTOGRAM_HEIGHT - index - 1

  if (heightLevel < inverseIndex) {
    return EMPTY_HISTOGRAM_CHAR
  }

  if (heightLevel > inverseIndex) {
    return FULL_HISTOGRAM_CHAR
  }

  return HISTOGRAM_CHARS[charIndex]
}

const getBottomLine = function (width, medianIndex) {
  const leftLineWidth = medianIndex - TICK_LEFT.length
  const rightLineWidth =
    width -
    leftLineWidth -
    TICK_LEFT.length -
    TICK_MIDDLE.length -
    TICK_RIGHT.length
  const leftLine = HORIZONTAL_LINE.repeat(leftLineWidth)
  const rightLine = HORIZONTAL_LINE.repeat(rightLineWidth)
  return `${TICK_LEFT}${leftLine}${TICK_MIDDLE}${rightLine}${TICK_RIGHT}`
}

const getAbscissa = function ({
  lowPretty,
  highPretty,
  width,
  medianIndex,
  medianPretty,
}) {
  const lowPrettyWidth = stringWidth(lowPretty)
  const medianPrettyWidth = stringWidth(medianPretty)
  const highPrettyWidth = stringWidth(highPretty)

  if (
    isStackedAbscissa({
      width,
      medianIndex,
      lowPrettyWidth,
      medianPrettyWidth,
      highPrettyWidth,
    })
  ) {
    return getStackedAbscissa({
      lowPretty,
      highPretty,
      width,
      medianIndex,
      medianPretty,
      lowPrettyWidth,
      medianPrettyWidth,
      highPrettyWidth,
    })
  }

  return getUnstackedAbscissa({
    lowPretty,
    highPretty,
    width,
    medianIndex,
    medianPretty,
    lowPrettyWidth,
    medianPrettyWidth,
    highPrettyWidth,
  })
}

const isStackedAbscissa = function ({
  width,
  medianIndex,
  lowPrettyWidth,
  medianPrettyWidth,
  highPrettyWidth,
}) {
  return (
    medianIndex < lowPrettyWidth + MEDIAN_PADDING ||
    medianIndex > width - highPrettyWidth - medianPrettyWidth - MEDIAN_PADDING
  )
}

const getStackedAbscissa = function ({
  lowPretty,
  highPretty,
  width,
  medianIndex,
  medianPretty,
  lowPrettyWidth,
  medianPrettyWidth,
  highPrettyWidth,
}) {
  const spacesWidth = width - lowPrettyWidth - highPrettyWidth
  const leftSpacesWidth = Math.min(medianIndex, width - medianPrettyWidth)
  const rightSpacesWidth = width - leftSpacesWidth - medianPrettyWidth
  const spaces = ' '.repeat(spacesWidth)
  const leftSpaces = ' '.repeat(leftSpacesWidth)
  const rightSpaces = ' '.repeat(rightSpacesWidth)
  return `${lowPretty}${spaces}${highPretty}
${leftSpaces}${medianPretty}${rightSpaces}`
}

const getUnstackedAbscissa = function ({
  lowPretty,
  highPretty,
  width,
  medianIndex,
  medianPretty,
  lowPrettyWidth,
  medianPrettyWidth,
  highPrettyWidth,
}) {
  const leftSpacesWidth = medianIndex - lowPrettyWidth
  const rightSpacesWidth =
    width -
    leftSpacesWidth -
    lowPrettyWidth -
    medianPrettyWidth -
    highPrettyWidth
  const leftSpaces = ' '.repeat(leftSpacesWidth)
  const rightSpaces = ' '.repeat(rightSpacesWidth)
  return `${lowPretty}${leftSpaces}${medianPretty}${rightSpaces}${highPretty}`
}
/* eslint-enable max-lines, max-statements */
