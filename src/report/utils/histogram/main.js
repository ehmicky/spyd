import { getReportWidth } from '../../tty.js'
import { concatBlocks } from '../concat.js'

import { EXTRA_HEIGHT } from './characters.js'
import { getContent } from './content.js'
import {
  getLowBlock,
  getLowBlockWidth,
  getHighBlock,
  getHighBlockWidth,
} from './low_high.js'
import { getTitleBlock, getTitleWidth } from './title.js'

// Serialize combinations' histograms for reporting
export const serializeHistograms = function (combinations, { showStats }) {
  const height = DEFAULT_HEIGHT
  const width = getContentWidth(combinations, showStats)
  return combinations.map((combination) =>
    serializeHistogram(combination, { width, height, showStats }),
  )
}

const DEFAULT_HEIGHT = 2 * EXTRA_HEIGHT

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
  { titles, stats, stats: { histogram } },
  { width, height, showStats },
) {
  const titleBlock = getTitleBlock(titles, height, showStats)

  if (histogram === undefined) {
    return titleBlock
  }

  const lowBlock = getLowBlock({ stats, height, showStats })
  const content = getContent({ stats, height, width, showStats })
  const highBlock = getHighBlock({ stats, height, showStats })
  return concatBlocks([titleBlock, lowBlock, content, highBlock])
}
