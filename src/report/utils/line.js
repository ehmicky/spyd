import { getPaddedScreenWidth } from '../tty.js'

import { separatorColor } from './colors.js'

// Separator between different reporters and/or preview elements
export const getLineSeparator = function () {
  const paddedScreenWidth = getPaddedScreenWidth()
  return `${separatorColor(LINE_CHAR.repeat(paddedScreenWidth))}\n`
}

// Works with all terminals
const LINE_CHAR = '\u2500'
