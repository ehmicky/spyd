import { concatBlocks } from '../concat.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import {
  getMinBlock,
  getMinBlockWidth,
  getMaxBlock,
  getMaxBlockWidth,
} from './min_max.js'
import { getTitleBlock, getTitleBlockWidth } from './title.js'

// Serialize combinations' histograms for reporting
export const serializeHistograms = function (
  combinations,
  { mini, screenWidth },
) {
  const height = DEFAULT_HEIGHT
  const width = getContentWidth(combinations, mini, screenWidth)
  return combinations
    .map((combination) =>
      serializeHistogram({ combination, width, height, mini }),
    )
    .join('\n')
}

const DEFAULT_HEIGHT = 2 * EXTRA_HEIGHT

const getContentWidth = function (combinations, mini, screenWidth) {
  return Math.max(
    screenWidth -
      getTitleBlockWidth(combinations) -
      getMinBlockWidth(combinations, mini) -
      getMaxBlockWidth(combinations, mini),
    1,
  )
}

const serializeHistogram = function ({
  combination,
  combination: { stats },
  width,
  height,
  mini,
}) {
  const titleBlock = getTitleBlock(combination, height, mini)

  if (hasLowLoops(stats)) {
    return titleBlock
  }

  const minBlock = getMinBlock({ stats, height, mini })
  const content = getContent({ stats, height, width, mini })
  const maxBlock = getMaxBlock({ stats, height, mini })
  return concatBlocks([titleBlock, minBlock, content, maxBlock])
}

// When using `showPrecision` and not enough loops are available.
const hasLowLoops = function ({ mean, meanMin }) {
  return mean === undefined && meanMin === undefined
}
