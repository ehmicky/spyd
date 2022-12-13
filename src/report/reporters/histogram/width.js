import { getCombinationTitlePad } from '../../utils/combination_title.js'

import { getPaddedStatLength, getTickLength } from './abscissa.js'

// Compute the width of each column.
export const getWidths = (combinations, mini, screenWidth) => {
  const titlesWidth = getCombinationTitlePad(combinations[0]).length
  const minBlockWidth = getMinMaxBlockWidth(combinations, mini, 'min')
  const maxBlockWidth = getMinMaxBlockWidth(combinations, mini, 'max')
  const contentWidth = Math.max(
    screenWidth - titlesWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titlesWidth, minBlockWidth, contentWidth }
}

const getMinMaxBlockWidth = (combinations, mini, statName) =>
  mini
    ? 0
    : Math.max(
        ...combinations.map(
          ({ stats }) => getPaddedStatWidth(stats[statName]) + getTickLength(),
        ),
      )

const getPaddedStatWidth = (stat) =>
  stat === undefined ? 0 : getPaddedStatLength(stat)
