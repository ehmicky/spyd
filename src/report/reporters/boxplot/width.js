import { getCombinationPaddedName } from '../../utils/name.js'

import { getPaddedStatLength } from './box.js'
import { isMeasuredCombination } from './normalize.js'
import { getIndex } from './position.js'

// Compute the width of each column.
export const getWidths = function ({
  combinations,
  mini,
  screenWidth,
  minAll,
  maxAll,
}) {
  const titlesWidth = getCombinationPaddedName(combinations[0]).length
  const postTitlesWidth = Math.max(screenWidth - titlesWidth, 1)
  const minBlockWidth = getMinMaxBlockWidth({
    statName: 'min',
    combinations,
    mini,
    minAll,
    maxAll,
    contentWidth: postTitlesWidth,
  })
  const postMinBlockWidth = Math.max(postTitlesWidth - minBlockWidth, 1)
  const maxBlockWidth = getMinMaxBlockWidth({
    statName: 'max',
    combinations,
    mini,
    minAll,
    maxAll,
    contentWidth: postMinBlockWidth,
  })
  const contentWidth = Math.max(postMinBlockWidth - maxBlockWidth, 1)
  return { titlesWidth, minBlockWidth, contentWidth }
}

// Finds the smallest `minBlockWidth`/`maxBlockWidth` that fits all `min`/`max`
// labels. Computing it depends on the position on the screen of each
// combination's `min`/`max`. However, this in turns depends on `minBlockWidth`
// and `maxBlockWidth` since those change `contentWidth`. Therefore, we compute
// it iteratively until the final number stabilizes.
// eslint-disable-next-line max-statements
const getMinMaxBlockWidth = function ({
  statName,
  combinations,
  mini,
  minAll,
  maxAll,
  contentWidth,
}) {
  if (mini) {
    return 0
  }

  const combinationsQuantiles = combinations
    .filter(isMeasuredCombination)
    .map(({ quantiles }) => quantiles[statName])

  if (combinationsQuantiles.length === 0) {
    return 0
  }

  // eslint-disable-next-line fp/no-let
  let minMaxWidth = 0
  // eslint-disable-next-line fp/no-let
  let currentMinMaxWidth = 0

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutation
    currentMinMaxWidth = minMaxWidth
    const currentContentWidth = contentWidth - currentMinMaxWidth
    // eslint-disable-next-line fp/no-mutation
    minMaxWidth = Math.max(
      ...combinationsQuantiles.map((quantile) =>
        getMinMaxWidth({
          statName,
          quantile,
          minAll,
          maxAll,
          contentWidth: currentContentWidth,
        }),
      ),
    )
    // `minMaxWidth` should always be <= `currentMinMaxWidth`. Therefore this
    // loop always eventually ends.
  } while (minMaxWidth !== currentMinMaxWidth)

  return minMaxWidth
}

// Computes the minimum size for `minWidth`/`maxWidth` where a given
// combination's `min` or `max` label does not display beyond its borders.
const getMinMaxWidth = function ({
  statName,
  quantile: { raw, pretty },
  minAll,
  maxAll,
  contentWidth,
}) {
  const index = getIndex({ raw, minAll, maxAll, contentWidth })
  const indexShift = statName === 'min' ? index : contentWidth - 1 - index
  return Math.max(getPaddedStatLength(pretty) - indexShift, 0)
}
