import { getColWidths } from '../../utils/width.js'

import { getPaddedStatLength } from './box.js'

// Compute the width of each column.
export const getWidths = function (combinations, mini, screenWidth) {
  const minWidths = combinations.map(getBoxPlotColWidth.bind(undefined, 'min'))
  const maxWidths = combinations.map(getBoxPlotColWidth.bind(undefined, 'max'))
  return getColWidths({ combinations, minWidths, maxWidths, mini, screenWidth })
}

const getBoxPlotColWidth = function (statName, { quantiles }) {
  return quantiles === undefined
    ? 0
    : getPaddedStatLength(quantiles[statName].pretty)
}
