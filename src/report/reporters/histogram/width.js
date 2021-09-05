import { getColWidths } from '../../utils/width.js'

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
