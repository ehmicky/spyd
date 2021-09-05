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
  const { positions, meanIndex, meanMaxWidth } = getMedianPositions(
    stats,
    width,
  )
  const rows = getHistogramRows({
    histogram,
    width,
    height,
    meanIndex,
    meanMaxWidth,
  })

  if (!showStats) {
    return rows
  }

  const abscissa = getAbscissa(width, positions)
  return `${rows}
${abscissa}`
}
