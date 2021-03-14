import { getReportWidth } from '../../tty.js'
import { getCombinationName } from '../title.js'

import { getAbscissa } from './abscissa.js'
import { getBottomLine } from './bottom_line.js'
import { getMedianPosition } from './median.js'
import { getHistogramRows } from './rows.js'

// Serialize combinations' histograms for reporting
export const serializeHistograms = function (combinations, { height }) {
  const combinationsA = combinations.filter(hasHistogram)

  if (combinationsA.length === 0) {
    return combinationsA
  }

  const width = getReportWidth()
  return combinationsA.map((combination) =>
    serializeHistogram(combination, { width, height }),
  )
}

const hasHistogram = function ({ stats: { histogram } }) {
  return histogram !== undefined
}

const serializeHistogram = function (
  {
    titles,
    stats: {
      histogram,
      low,
      lowPretty,
      median,
      medianPretty,
      high,
      highPretty,
    },
  },
  { width, height },
) {
  const name = getCombinationName(titles)
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
  return `${name}

${rows}
${bottomLine}
${abscissa}`
}
