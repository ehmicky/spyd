import { getAbscissa } from './abscissa.js'
import { getHistogramRows } from './rows.js'

// Retrieve histogram main content
export const getContent = function ({
  stats: { histogram, median, min, max },
  height,
  width,
  mini,
}) {
  const medianIndex = getMedianIndex({ median, min, max, width })
  const rows = getHistogramRows({ histogram, width, height, medianIndex })

  if (mini) {
    return rows
  }

  const abscissa = getAbscissa(width, median, medianIndex)
  return `${rows}\n${abscissa}`
}

// Compute the position of the median tick on the screen.
// When `histogram` has a single item, it is in the first bucket.
const getMedianIndex = function ({ median, min, max, width }) {
  const medianPercentage =
    max.raw === min.raw ? 0 : (median.raw - min.raw) / (max.raw - min.raw)
  return Math.round((width - 1) * medianPercentage)
}
