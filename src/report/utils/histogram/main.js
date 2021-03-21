import stringWidth from 'string-width'

import { getReportWidth } from '../../tty.js'
import { concatBlocks } from '../concat.js'

import { getContent } from './content.js'
import { getSidebar, getSidebarName } from './sidebar.js'

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
  return getReportWidth() - getSidebarWidth(combinations) - SIDE_PADDING
}

const getSidebarWidth = function ([{ titles }]) {
  return stringWidth(getSidebarName(titles))
}

const serializeHistogram = function ({ titles, stats }, { width, height }) {
  const sidebar = getSidebar(titles)
  const padding = ' '.repeat(SIDE_PADDING)
  const content = getContent({ stats, width, height })
  return concatBlocks([sidebar, padding, content])
}

const SIDE_PADDING = 1
