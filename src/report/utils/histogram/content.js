import { getAbscissa } from './abscissa.js'
import { getBottomLine } from './bottom_line.js'
import { getMedianPosition } from './median.js'
import { getHistogramRows } from './rows.js'

// Retrieve histogram main content
export const getContent = function ({
  stats: { histogram, low, lowPretty, median, medianPretty, high, highPretty },
  width,
  height,
}) {
  const { medianIndex, medianMaxWidth } = getMedianPosition({
    median,
    low,
    high,
    width,
  })
  const rows = getHistogramRows({
    histogram,
    width,
    height,
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
