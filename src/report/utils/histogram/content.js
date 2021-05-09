import { getAbscissa } from './abscissa.js'
import { getMedianPositions } from './positions.js'
import { getHistogramRows } from './rows.js'

// Retrieve histogram main content
export const getContent = function ({
  stats,
  stats: { histogram },
  height,
  width,
  showStats,
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

  if (!showStats) {
    return rows
  }

  const abscissa = getAbscissa(width, positions)
  return `${rows}
${abscissa}`
}
