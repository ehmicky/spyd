import { getCombinationPaddedName } from '../../utils/name.js'

import { getPaddedStatLength } from './abscissa.js'

// Compute the width of each column.
export const getWidths = function (combinations, mini, screenWidth) {
  const minWidths = combinations.map(
    getHistogramColWidth.bind(undefined, 'min'),
  )
  const maxWidths = combinations.map(
    getHistogramColWidth.bind(undefined, 'max'),
  )
  return getColWidths({ combinations, minWidths, maxWidths, mini, screenWidth })
}

const getHistogramColWidth = function (statName, { stats }) {
  return stats[statName] === undefined
    ? 0
    : getPaddedStatLength(stats[statName])
}

const getColWidths = function ({
  combinations,
  minWidths,
  maxWidths,
  mini,
  screenWidth,
}) {
  const titlesWidth = getCombinationPaddedName(combinations[0]).length
  const minBlockWidth = getMinMaxBlockWidth(combinations, mini, minWidths)
  const maxBlockWidth = getMinMaxBlockWidth(combinations, mini, maxWidths)
  const contentWidth = Math.max(
    screenWidth - titlesWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titlesWidth, minBlockWidth, contentWidth }
}

const getMinMaxBlockWidth = function (combinations, mini, widths) {
  return mini ? 0 : Math.max(...widths)
}
