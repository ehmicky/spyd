import { concatBlocks } from '../concat.js'
import { getCombinationNameWidth } from '../name.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import {
  getMinBlock,
  getMinBlockWidth,
  getMaxBlock,
  getMaxBlockWidth,
} from './min_max.js'
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
      getMinBlockWidth(combinations, showStats) -
      getMaxBlockWidth(combinations, showStats),
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

  const minBlock = getMinBlock({ stats, height, showStats })
  const content = getContent({ stats, height, width, showStats })
  const maxBlock = getMaxBlock({ stats, height, showStats })
  return concatBlocks([titleBlock, minBlock, content, maxBlock])
}

// When using `showPrecision` and not enough loops are available,
// `medianMin` and `medianMax` will be `undefined`. In that case, we keep
// waiting for more loops before doing a full report
const hasLowLoops = function ({ median, medianMin }) {
  return median === undefined && medianMin.raw === undefined
}
