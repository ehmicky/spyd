import { getCombNamePaddedColor } from '../../utils/name.js'

import { getAbscissa } from './abscissa.js'
import { EXTRA_HEIGHT } from './characters.js'
import { getEmptyCombination } from './empty.js'
import { getHistogramRows } from './rows.js'
import { getWidths } from './width.js'

// Reporter showing distribution of measures with a histogram
// We show the `min`, `max` and `median`.
// The `median` is shown instead of the `mean` because:
//  - This reporter is meant to see the distribution, not to compare
//    combinations' means
//  - This shows consistent results with other distribution-based reporters
//    such as `boxplot`
// Configuration properties:
//  - `mini` (default: false): hide `min`, `median` and `max` labels
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const height = 2 * EXTRA_HEIGHT
  const { titlesWidth, minBlockWidth, contentWidth } = getWidths(
    combinations,
    mini,
    screenWidth,
  )
  return combinations
    .map((combination) =>
      serializeCombination({
        combination,
        titlesWidth,
        minBlockWidth,
        contentWidth,
        height,
        mini,
      }),
    )
    .join('\n')
}

const serializeCombination = function ({
  combination,
  combination: {
    stats: { histogram, median, min, max },
  },
  titlesWidth,
  minBlockWidth,
  contentWidth,
  height,
  mini,
}) {
  const combinationTitles = getCombNamePaddedColor(combination)

  if (histogram === undefined) {
    return getEmptyCombination(combination, height, mini)
  }

  const medianIndex = getMedianIndex({ median, min, max, contentWidth })
  const rows = getHistogramRows({
    histogram,
    combinationTitles,
    titlesWidth,
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
        titlesWidth,
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
