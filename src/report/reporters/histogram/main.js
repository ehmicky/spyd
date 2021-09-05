import { getCombNamePaddedColor } from '../../utils/name.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import { getEmptyCombination } from './empty.js'
import { getWidths } from './width.js'

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

export const histogram = { reportTerminal, capabilities: { debugStats: true } }
