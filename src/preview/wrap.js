import wrapAnsi from 'wrap-ansi'

import { getScreenWidth, getPaddedScreenWidth } from '../report/tty.js'

// Rows that are larger than the terminal screen width must be broken down
// (line wrapping). This is because the scrolling logic needs to know the number
// of physical rows, not logical rows.
export const wrapRows = function (string) {
  return wrapString(string, getScreenWidth())
}

export const wrapPaddedRows = function (string) {
  return wrapString(string, getPaddedScreenWidth())
}

const wrapString = function (string, width) {
  return wrapAnsi(string, width, { hard: true, trim: false })
}
