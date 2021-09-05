import { getCombinationPaddedName } from '../../utils/name.js'

import { getPaddedStatLength } from './abscissa.js'

// Compute the width of each columns for reporters which show the following ones
// for each combination:
//  - Title
//  - Min
//  - Main content
//  - Max
// This is used for example by the `histogram` and `boxplot` reporters.
export const getWidths = function (combinations, mini, screenWidth) {
  const titlesWidth = getCombinationPaddedName(combinations[0]).length
  const minBlockWidth = getMinMaxBlockWidth(combinations, mini, 'min')
  const maxBlockWidth = getMinMaxBlockWidth(combinations, mini, 'max')
  const contentWidth = Math.max(
    screenWidth - titlesWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titlesWidth, minBlockWidth, contentWidth }
}

const getMinMaxBlockWidth = function (combinations, mini, statName) {
  if (mini) {
    return 0
  }

  return Math.max(
    ...combinations.map((combination) =>
      getSingleMinMaxWidth(combination, statName),
    ),
  )
}

const getSingleMinMaxWidth = function ({ stats }, statName) {
  return stats[statName] === undefined
    ? 0
    : getPaddedStatLength(stats[statName])
}
