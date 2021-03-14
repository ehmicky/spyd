import { getReportWidth } from '../../tty.js'

import { getAbscissa } from './abscissa.js'
import { getBottomLine } from './bottom_line.js'
import { getHistogramRows } from './rows.js'

export const serializeHistograms = function (combinations) {
  const combinationsA = combinations.filter(hasHistogram)

  if (combinationsA.length === 0) {
    return combinationsA
  }

  const width = getReportWidth()
  return combinationsA.map(({ stats }) => serializeHistogram(stats, width))
}

const hasHistogram = function ({ stats: { histogram } }) {
  return histogram !== undefined
}

// Serialize a combination's histogram for reporting
const serializeHistogram = function (
  { histogram, low, lowPretty, median, medianPretty, high, highPretty },
  width,
) {
  const { medianIndex, medianMaxWidth } = getMedianPosition({
    median,
    low,
    high,
    width,
  })
  const rows = getHistogramRows({
    histogram,
    width,
    medianIndex,
    medianMaxWidth,
  })
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

// Compute position of the median tick.
// When `histogram` has a single item, it is in the first bucket.
// Also compute the maximum width between the median and either the start or end
const getMedianPosition = function ({ median, low, high, width }) {
  const medianPercentage = high === low ? 0 : (median - low) / (high - low)
  const indexWidth = width - 1
  const medianIndex = Math.round(indexWidth * medianPercentage)
  const medianMaxWidth = Math.max(medianIndex, indexWidth - medianIndex)
  return { medianIndex, medianMaxWidth }
}
