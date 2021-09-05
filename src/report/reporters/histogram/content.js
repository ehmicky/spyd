import { getAbscissa } from './abscissa.js'
import { getHistogramRows } from './rows.js'

// Retrieve histogram main content
export const getContent = function ({
  stats,
  stats: { histogram },
  height,
  width,
  mini,
}) {
  const { positions, medianIndex, medianMaxWidth } = getMedianPositions(
    stats,
    width,
  )
  const rows = getHistogramRows({
    histogram,
    width,
    height,
    medianIndex,
    medianMaxWidth,
  })

  if (mini) {
    return rows
  }

  const abscissa = getAbscissa(width, positions)
  return `${rows}
${abscissa}`
}

// Compute positions of the median tick.
// When `histogram` has a single item, it is in the first bucket.
// Also compute the maximum width between the median and either the start or end
// Also computes `medianIndex|medianMaxWidth` used for the color gradient.
const getMedianPositions = function ({ median, min, max }, width) {
  const medianPercentage =
    max.raw === min.raw ? 0 : (median.raw - min.raw) / (max.raw - min.raw)
  const medianIndex = Math.round((width - 1) * medianPercentage)
  const positions = [{ ...median, index: medianIndex }]
  const medianMaxWidth = Math.max(medianIndex, width - 1 - medianIndex)
  return { positions, medianIndex, medianMaxWidth }
}
