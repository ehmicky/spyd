import wrapAnsi from 'wrap-ansi'

import { getScreenWidth } from '../report/tty.js'

// Rows that are larger than the terminal screen width must be broken down
// (line wrapping). This is because the scrolling logic needs to know the number
// of physical rows, not logical rows.
// We need to subtract 1 to take into account final newlines at the end of each
// row.
export const wrapRows = function (string) {
  const screenWidth = getScreenWidth()
  return wrapAnsi(string, screenWidth - 1, { hard: true, trim: false })
}
