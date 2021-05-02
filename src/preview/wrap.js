import wrapAnsi from 'wrap-ansi'

import { getScreenWidth } from '../report/tty.js'

// Rows that are larger than the terminal screen width must be broken down
// (line wrapping). This is because the scrolling logic needs to know the number
// of physical rows, not logical rows.
export const wrapRows = function (string) {
  const screenWidth = getScreenWidth()
  return wrapAnsi(string, screenWidth, { hard: true, trim: false })
}
