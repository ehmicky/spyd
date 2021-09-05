import { getPaddedScreenWidth } from '../tty.js'

import { separatorColor } from './colors.js'

// Separator between different reporters and/or preview elements
export const getLineSeparator = function () {
  const paddedScreenWidth = getPaddedScreenWidth()
  return `${separatorColor(HORIZONTAL_LINE.repeat(paddedScreenWidth))}\n`
}

// Works with all terminals
const HORIZONTAL_LINE = '\u2500'
