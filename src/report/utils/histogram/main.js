import { concatBlocks } from '../concat.js'
import { getCombinationNameWidth } from '../name.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import {
  getLowBlock,
  getLowBlockWidth,
  getHighBlock,
  getHighBlockWidth,
} from './low_high.js'
import { getTitleBlock } from './title.js'

// Serialize combinations' histograms for reporting
export const serializeHistograms = function (
  combinations,
  { showStats, screenWidth },
) {
  const height = DEFAULT_HEIGHT
  const width = getContentWidth(combinations, showStats, screenWidth)
  return combinations.map((combination) =>
    serializeHistogram({ combination, width, height, showStats }),
  )
}

const DEFAULT_HEIGHT = 2 * EXTRA_HEIGHT

const getContentWidth = function (combinations, showStats, screenWidth) {
  return Math.max(
    screenWidth -
      getCombinationNameWidth(combinations[0]) -
      getLowBlockWidth(combinations, showStats) -
      getHighBlockWidth(combinations, showStats),
    1,
  )
}

const serializeHistogram = function ({
  combination,
  combination: {
    stats,
    stats: { histogram },
  },
  width,
  height,
  showStats,
}) {
  const titleBlock = getTitleBlock(combination, height, showStats)

  if (histogram === undefined || hasLowLoops(stats)) {
    return titleBlock
  }

  const lowBlock = getLowBlock({ stats, height, showStats })
  const content = getContent({ stats, height, width, showStats })
  const highBlock = getHighBlock({ stats, height, showStats })
  return concatBlocks([titleBlock, lowBlock, content, highBlock])
}

// When using `showPrecision` and not enough loops are available, `median`,
// `medianLow` and `medianHigh` will be `undefined`. In that case, we keep
// waiting for more loops before doing a full report
const hasLowLoops = function ({ median, medianLow }) {
  return median.raw === undefined && medianLow.raw === undefined
}
