/* eslint-disable max-lines */
import stringWidth from 'string-width'

import { getReportWidth } from '../../tty.js'
import { separatorColor, graphGradientColor } from '../colors.js'

import { resizeHistogram } from './resize.js'
import { smoothHistogram } from './smooth.js'

export const getHistograms = function (combinations) {
  const combinationsA = combinations.filter(hasHistogram)

  if (combinationsA.length === 0) {
    return combinationsA
  }

  const width = getReportWidth()
  return combinationsA.map(({ stats }) => getHistogram(stats, width))
}

const hasHistogram = function ({ stats: { histogram } }) {
  return histogram !== undefined
}

const getHistogram = function (
  { histogram, low, lowPretty, median, medianPretty, high, highPretty },
  width,
) {
  const { medianIndex, medianMaxWidth } = getMedianPosition({
    median,
    low,
    high,
    width,
  })

  const columns = getHistogramColumns({
    histogram,
    width,
    medianIndex,
    medianMaxWidth,
  })
  const rows = getHistogramRows(columns)
  const bottomLine = getBottomLine(width, medianIndex)
  const abscissa = getAbscissa({
    lowPretty,
    highPretty,
    width,
    medianIndex,
    medianPretty,
  })
  return `${rows}
${bottomLine}
${abscissa}`
}

// Compute position of the median tick
// When `histogram` has a single item, it is in the first bucket.
const getMedianPosition = function ({ median, low, high, width }) {
  const medianPercentage = high === low ? 0 : (median - low) / (high - low)
  const indexWidth = width - 1
  const medianIndex = Math.round(indexWidth * medianPercentage)
  const medianMaxWidth = Math.max(medianIndex, indexWidth - medianIndex)
  return { medianIndex, medianMaxWidth }
}

const getHistogramColumns = function ({
  histogram,
  width,
  medianIndex,
  medianMaxWidth,
}) {
  const frequencies = histogram.map(getFrequency)
  const frequenciesA = smoothHistogramEnds(frequencies)
  const frequenciesB = resizeHistogram(frequenciesA, width)
  const frequenciesC = smoothHistogram(frequenciesB, SMOOTH_PERCENTAGE)
  const maxFrequency = Math.max(...frequenciesC)
  const columns = frequenciesC.map((frequency, columnIndex) =>
    getHistogramColumn({
      frequency,
      maxFrequency,
      columnIndex,
      medianIndex,
      medianMaxWidth,
    }),
  )
  return columns
}

const getFrequency = function ([, , frequency]) {
  return frequency
}

// We truncate the first|last percentiles of the histogram to remove outliers.
// However, this means the first|last bucket of the truncated histogram are
// more likely to be high (or somewhat high) frequency, which gives the
// impression that the truncation removed more than just a few outliers.
// This also makes the histogram not go to the bottom on both ends, which make
// it look incomplete.
// We fix this by adding `0` buckets on both ends.
const smoothHistogramEnds = function (frequencies) {
  return [0, ...frequencies, 0]
}

// Smooth each bucket, by using an arithmetic mean with the nearby buckets.
// This is the number of neighbors to use, as a percentage to the total number
// of buckets.
// A higher number is more likely to hide significant useful bumps in the
// histogram.
// A lower number is less likely to smooth the histogram enough to make it
// look nice and reduce the shakiness.
const SMOOTH_PERCENTAGE = 0.05

const getHistogramColumn = function ({
  frequency,
  maxFrequency,
  columnIndex,
  medianIndex,
  medianMaxWidth,
}) {
  const height = (HISTOGRAM_HEIGHT * frequency) / maxFrequency
  const heightLevel = Math.floor(height)
  const charIndex = Math.ceil(
    (height - heightLevel) * (HISTOGRAM_CHARS.length - 1),
  )
  const colorPercentage = Math.abs(medianIndex - columnIndex) / medianMaxWidth
  const color = graphGradientColor(colorPercentage)
  return { heightLevel, charIndex, color }
}

const getHistogramRows = function (columns) {
  return Array.from({ length: HISTOGRAM_HEIGHT }, (_, index) =>
    getHistogramRow(index, columns),
  ).join('\n')
}

const getHistogramRow = function (index, columns) {
  return columns
    .map(({ heightLevel, charIndex, color }) =>
      getHistogramCell({ heightLevel, charIndex, color, index }),
    )
    .join('')
}

const getHistogramCell = function ({ heightLevel, charIndex, color, index }) {
  const inverseIndex = HISTOGRAM_HEIGHT - index - 1

  if (heightLevel < inverseIndex) {
    return EMPTY_HISTOGRAM_CHAR
  }

  if (heightLevel > inverseIndex) {
    return color(FULL_HISTOGRAM_CHAR)
  }

  return color(HISTOGRAM_CHARS[charIndex])
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
  return separatorColor(
    `${TICK_LEFT}${leftLine}${TICK_MIDDLE}${rightLine}${TICK_RIGHT}`,
  )
}

const HORIZONTAL_LINE = '\u2500'
const TICK_LEFT = '\u250C'
const TICK_MIDDLE = '\u252C'
const TICK_RIGHT = '\u2510'

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

const MEDIAN_PADDING = 1

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
/* eslint-enable max-lines */
