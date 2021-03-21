import { getAbscissa } from './abscissa.js'
import { getHistogramRows } from './rows.js'

// Retrieve histogram main content
export const getContent = function (
  { histogram, low, median, medianPretty, high },
  height,
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
    height,
    medianIndex,
    medianMaxWidth,
  })
  const abscissa = getAbscissa(width, medianIndex, medianPretty)
  return `${rows}
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
