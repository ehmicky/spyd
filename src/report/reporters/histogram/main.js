import { getCombTitleColorPad } from '../../utils/combination_title.js'

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
//  - `smooth` (default: true): smooth the histogram values
//     - This is especially useful when there are only a few measures that are
//       all integers
export const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false, smooth = true },
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
        smooth,
      }),
    )
    .join('\n')
}

const serializeCombination = function ({
  combination,
  combination: {
    stats: { histogram, quantiles, min, max },
  },
  titlesWidth,
  minBlockWidth,
  contentWidth,
  height,
  mini,
  smooth,
}) {
  const combinationTitles = getCombTitleColorPad(combination)

  if (histogram === undefined) {
    return getEmptyCombination(combination, height, mini)
  }

  const median = quantiles[MEDIAN_QUANTILE]
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
    smooth,
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

// `median` is discouraged by `debugStats`.
// Distribution reporters should use `quantiles` if they do need it.
const MEDIAN_QUANTILE = 50

// Compute the position of the median tick on the screen.
// When `histogram` has a single item, it is in the first bucket.
const getMedianIndex = function ({ median, min, max, contentWidth }) {
  const percentage =
    max.raw === min.raw ? 0 : (median.raw - min.raw) / (max.raw - min.raw)
  return Math.min(Math.floor(percentage * contentWidth), contentWidth - 1)
}
