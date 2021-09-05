import { concatBlocks } from '../../utils/concat.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import {
  getMinBlock,
  getMinBlockWidth,
  getMaxBlock,
  getMaxBlockWidth,
} from './min_max.js'
import { getTitleBlock, getTitleBlockWidth } from './title.js'

// Reporter showing distribution of measures with a histogram
// Configuration properties:
//  - `mini` (default: false): hide `min`, `median` and `max` labels
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const height = 2 * EXTRA_HEIGHT
  const contentWidth = getWidths(combinations, mini, screenWidth)
  return combinations
    .map((combination) =>
      serializeHistogram({ combination, contentWidth, height, mini }),
    )
    .join('\n')
}

const getWidths = function (combinations, mini, screenWidth) {
  const contentWidth = Math.max(
    screenWidth -
      getTitleBlockWidth(combinations) -
      getMinBlockWidth(combinations, mini) -
      getMaxBlockWidth(combinations, mini),
    1,
  )
  return contentWidth
}

const serializeHistogram = function ({
  combination,
  combination: {
    stats,
    stats: { median },
  },
  contentWidth,
  height,
  mini,
}) {
  const titleBlock = getTitleBlock(combination, height, mini)

  if (median === undefined) {
    return titleBlock
  }

  const minBlock = getMinBlock({ stats, height, mini })
  const content = getContent({ stats, height, contentWidth, mini })
  const maxBlock = getMaxBlock({ stats, height, mini })
  return concatBlocks([titleBlock, minBlock, content, maxBlock])
}

export const histogram = { reportTerminal, capabilities: { debugStats: true } }
