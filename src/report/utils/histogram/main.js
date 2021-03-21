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
export const serializeHistograms = function (combinations, { height }) {
  const combinationsA = combinations.filter(hasHistogram)

  if (combinationsA.length === 0) {
    return combinationsA
  }

  const width = getContentWidth(combinationsA)
  return combinationsA.map((combination) =>
    serializeHistogram(combination, { width, height }),
  )
}

const hasHistogram = function ({ stats: { histogram } }) {
  return histogram !== undefined
}

const getContentWidth = function (combinations) {
  return Math.max(
    getReportWidth() -
      getTitleWidth(combinations) -
      getLowBlockWidth(combinations) -
      getHighBlockWidth(combinations),
    1,
  )
}

const serializeHistogram = function ({ titles, stats }, { width, height }) {
  const titleBlock = getTitleBlock(titles, height)
  const lowBlock = getLowBlock(stats, height)
  const content = getContent(stats, height, width)
  const highBlock = getHighBlock(stats, height)
  return concatBlocks([titleBlock, lowBlock, content, highBlock])
}
