import wrapAnsi from 'wrap-ansi'

import { getScreenWidth, getPaddedScreenWidth } from '../report/tty.js'

// Rows that are larger than the terminal screen width must be broken down
// (line wrapping). This is because the scrolling logic needs to know the number
// of physical rows, not logical rows.
export const wrapPaddedRows = function (string) {
  return wrapAnsi(string, getPaddedScreenWidth(), { hard: true, trim: false })
}

export const wrapRows = function (string) {
  return wrapAnsi(string, getScreenWidth(), { hard: true, trim: false })
}
