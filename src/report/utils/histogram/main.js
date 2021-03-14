import { getReportWidth } from '../../tty.js'

import { getAbscissa } from './abscissa.js'
import { getBottomLine } from './bottom_line.js'
import { getMedianPosition } from './median.js'
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
