import {
  getCombNamePaddedColor,
  getCombinationPaddedName,
} from '../../utils/name.js'

import { ABSCISSA_BOTTOM_HEIGHT, ABSCISSA_LABELS_HEIGHT } from './abscissa.js'
import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import { getMinBlockWidth, getMaxBlockWidth } from './min_max.js'

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
  const titleBlockWidth = getCombinationPaddedName(combinations[0]).length
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

  if (median === undefined) {
    return getEmptyCombination(combination, height, mini)
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

const getEmptyCombination = function (combination, height, mini) {
  const topNewlines = getTopNewlines(height, mini)
  const bottomNewlines = getBottomNewlines(mini)
  const combinationTitles = getCombNamePaddedColor(combination)
  return `${topNewlines}${combinationTitles}\n${bottomNewlines}`
}

const getTopNewlines = function (height, mini) {
  const topNewlinesHeight = height - (mini ? ABSCISSA_BOTTOM_HEIGHT : 0)
  return '\n'.repeat(topNewlinesHeight)
}

const getBottomNewlines = function (mini) {
  const bottomNewlinesHeight = mini ? 0 : ABSCISSA_LABELS_HEIGHT
  return '\n'.repeat(bottomNewlinesHeight)
}

export const histogram = { reportTerminal, capabilities: { debugStats: true } }
