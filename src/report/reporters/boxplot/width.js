import { getCombinationTitlePad } from '../../utils/combination_title.js'

import { getPaddedStatLength } from './box.js'
import { isMeasuredCombination } from './normalize.js'
import { getIndex } from './position.js'

// Compute the width of each column.
export const getWidths = ({
  combinations,
  mini,
  screenWidth,
  minAll,
  maxAll,
}) => {
  const titlesWidth = getCombinationTitlePad(combinations[0]).length
  const combinationsA = combinations.filter(isMeasuredCombination)
  const contentWidth = subtractToContentWidth(screenWidth, titlesWidth)
  const minBlockWidth = getMinMaxBlockWidth({
    statName: 'min',
    combinations: combinationsA,
    mini,
    minAll,
    maxAll,
    contentWidth,
  })
  const contentWidthA = subtractToContentWidth(contentWidth, minBlockWidth)
  const maxBlockWidth = getMinMaxBlockWidth({
    statName: 'max',
    combinations: combinationsA,
    mini,
    minAll,
    maxAll,
    contentWidth: contentWidthA,
  })
  const contentWidthB = subtractToContentWidth(contentWidthA, maxBlockWidth)
  return { titlesWidth, minBlockWidth, contentWidth: contentWidthB }
}

const subtractToContentWidth = (contentWidth, columnWidth) =>
  Math.max(contentWidth - columnWidth, 1)

// Finds the smallest `minBlockWidth`/`maxBlockWidth` that fits all `min`/`max`
// labels. Computing it depends on the position on the screen of each
// combination's `min`/`max`. However, this in turns depends on `minBlockWidth`
// and `maxBlockWidth` since those change `contentWidth`. Therefore, we compute
// it iteratively until the final number stabilizes.
const getMinMaxBlockWidth = ({
  statName,
  combinations,
  mini,
  minAll,
  maxAll,
  contentWidth,
}) => {
  if (mini || combinations.length === 0) {
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
      ...combinations.map((combination) =>
        getMinMaxWidth({
          statName,
          combination,
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
const getMinMaxWidth = ({
  statName,
  combination: {
    quantiles: {
      [statName]: { raw, pretty },
    },
  },
  minAll,
  maxAll,
  contentWidth,
}) => {
  const index = getIndex({ raw, minAll, maxAll, contentWidth })
  const indexShift = statName === 'min' ? index : contentWidth - 1 - index
  return Math.max(getPaddedStatLength(pretty) - indexShift, 0)
}
