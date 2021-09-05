import { getCombNamePaddedColor } from '../../utils/name.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import { getMinBlockWidth, getMaxBlockWidth } from './min_max.js'
import { getTitleBlock, getTitleBlockWidth } from './title.js'

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

const getWidths = function (combinations, mini, screenWidth) {
  const titleBlockWidth = getTitleBlockWidth(combinations)
  const minBlockWidth = getMinBlockWidth(combinations, mini)
  const maxBlockWidth = getMaxBlockWidth(combinations, mini)
  const contentWidth = Math.max(
    screenWidth - titleBlockWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titleBlockWidth, minBlockWidth, contentWidth }
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
  const titleBlock = getTitleBlock(combination, height, mini)

  if (median === undefined) {
    return titleBlock
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

export const histogram = { reportTerminal, capabilities: { debugStats: true } }
