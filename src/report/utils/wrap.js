import wrapAnsi from 'wrap-ansi'

import { getScreenWidth, getPaddedScreenWidth } from '../tty.js'

// Rows that are larger than the terminal screen width must be broken down
// (line wrapping). This is because:
//  - The scrolling logic needs to know the number of physical rows, not
//    logical rows.
//  - If reporters are not responsive to terminal width, their output to files
//    would create long lines, while others would not, which can be odd when
//    mixed together
export const wrapRows = function (string) {
  if (string === undefined) {
    return
  }

  return wrapString(string, getScreenWidth())
}

export const wrapPaddedRows = function (string) {
  return wrapString(string, getPaddedScreenWidth())
}

const wrapString = function (string, width) {
  return wrapAnsi(string, width, { hard: true, trim: false })
}
