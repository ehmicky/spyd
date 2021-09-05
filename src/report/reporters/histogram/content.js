import { getAbscissa } from './abscissa.js'
import { getHistogramRows } from './rows.js'

// Retrieve histogram main content
export const getContent = function ({
  stats: { histogram, median, min, max },
  height,
  contentWidth,
  mini,
}) {
  const medianIndex = getMedianIndex({ median, min, max, contentWidth })
  const rows = getHistogramRows({
    histogram,
    contentWidth,
    height,
    medianIndex,
  })

  if (mini) {
    return rows
  }

  const abscissa = getAbscissa(contentWidth, median, medianIndex)
  return `${rows}\n${abscissa}`
}

// Compute the position of the median tick on the screen.
// When `histogram` has a single item, it is in the first bucket.
const getMedianIndex = function ({ median, min, max, contentWidth }) {
  const percentage =
    max.raw === min.raw ? 0 : (median.raw - min.raw) / (max.raw - min.raw)
  return Math.min(Math.floor(percentage * contentWidth), contentWidth - 1)
}
