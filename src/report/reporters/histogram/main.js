import { getCombNamePaddedColor } from '../../utils/name.js'

import { getAbscissa } from './abscissa.js'
import { EXTRA_HEIGHT } from './characters.js'
import { getEmptyCombination } from './empty.js'
import { getHistogramRows } from './rows.js'
import { getWidths } from './width.js'

// Reporter showing distribution of measures with a histogram
// Configuration properties:
//  - `mini` (default: false): hide `min`, `median` and `max` labels
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const height = 2 * EXTRA_HEIGHT
  const { titleBlockWidth, minBlockWidth, contentWidth } = getWidths(
    combinations,
    mini,
    screenWidth,
  )
  return combinations
    .map((combination) =>
      serializeHistogram({
        combination,
        titleBlockWidth,
        minBlockWidth,
        contentWidth,
        height,
        mini,
      }),
    )
    .join('\n')
}

const serializeHistogram = function ({
  combination,
  combination: {
    stats,
    stats: { median },
  },
  titleBlockWidth,
  minBlockWidth,
  contentWidth,
  height,
  mini,
}) {
  const combinationTitles = getCombNamePaddedColor(combination)

  if (median === undefined) {
    return getEmptyCombination(combination, height, mini)
  }

  return getContent({
    stats,
    height,
    combinationTitles,
    titleBlockWidth,
    minBlockWidth,
    contentWidth,
    mini,
  })
}

// Retrieve histogram main content
const getContent = function ({
  stats: { histogram, median, min, max },
  height,
  combinationTitles,
  titleBlockWidth,
  minBlockWidth,
  contentWidth,
  mini,
}) {
  const medianIndex = getMedianIndex({ median, min, max, contentWidth })
  const rows = getHistogramRows({
    histogram,
    combinationTitles,
    titleBlockWidth,
    minBlockWidth,
    contentWidth,
    height,
    medianIndex,
    mini,
  })
  const abscissa = mini
    ? ''
    : getAbscissa({
        combinationTitles,
        titleBlockWidth,
        minBlockWidth,
        contentWidth,
        median,
        medianIndex,
        min,
        max,
      })
  return `${rows}${abscissa}`
}

// Compute the position of the median tick on the screen.
// When `histogram` has a single item, it is in the first bucket.
const getMedianIndex = function ({ median, min, max, contentWidth }) {
  const percentage =
    max.raw === min.raw ? 0 : (median.raw - min.raw) / (max.raw - min.raw)
  return Math.min(Math.floor(percentage * contentWidth), contentWidth - 1)
}

export const histogramReporter = {
  reportTerminal,
  capabilities: { debugStats: true },
}
