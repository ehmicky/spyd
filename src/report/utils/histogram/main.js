import { getReportWidth } from '../../tty.js'
import { concatBlocks } from '../concat.js'

import { getContent } from './content.js'
import {
  getLowBlock,
  getLowBlockWidth,
  getHighBlock,
  getHighBlockWidth,
} from './low_high.js'
import { getTitleBlock, getTitleWidth } from './title.js'

// Serialize combinations' histograms for reporting
export const serializeHistograms = function (
  combinations,
  { height, showStats },
) {
  const combinationsA = combinations.filter(hasHistogram)

  if (combinationsA.length === 0) {
    return combinationsA
  }

  const width = getContentWidth(combinationsA, showStats)
  return combinationsA.map((combination) =>
    serializeHistogram(combination, { width, height, showStats }),
  )
}

const hasHistogram = function ({ stats: { histogram } }) {
  return histogram !== undefined
}

const getContentWidth = function (combinations, showStats) {
  return Math.max(
    getReportWidth() -
      getTitleWidth(combinations, showStats) -
      getLowBlockWidth(combinations, showStats) -
      getHighBlockWidth(combinations, showStats),
    1,
  )
}

const serializeHistogram = function (
  { titles, stats },
  { width, height, showStats },
) {
  const titleBlock = getTitleBlock(titles, height, showStats)
  const lowBlock = getLowBlock({ stats, height, showStats })
  const content = getContent({ stats, height, width, showStats })
  const highBlock = getHighBlock({ stats, height, showStats })
  return concatBlocks([titleBlock, lowBlock, content, highBlock])
}
