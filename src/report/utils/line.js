import { getPaddedScreenWidth, getScreenWidth } from '../tty.js'

import { separatorColor } from './colors.js'

// Separator between different reporters and/or footer
export const getLineSeparator = () => {
  const paddedScreenWidth = getPaddedScreenWidth()
  return `${separatorColor(HORIZONTAL_LINE.repeat(paddedScreenWidth))}\n`
}

// Works with all terminals
const HORIZONTAL_LINE = '\u2013'

// Separator above the preview bottom bar
export const getFullLineSeparator = () => {
  const screenWidth = getScreenWidth()
  return `${separatorColor(FULL_HORIZONTAL_LINE.repeat(screenWidth))}\n`
}

// Works with all terminals
const FULL_HORIZONTAL_LINE = '\u2501'
