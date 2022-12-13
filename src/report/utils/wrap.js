import wrapAnsi from 'wrap-ansi'

import { getScreenWidth } from '../tty.js'

// Rows that are larger than the terminal screen width must be broken down
// (line wrapping). This is because:
//  - The scrolling logic needs to know the number of physical rows, not
//    logical rows.
//  - If reporters are not responsive to terminal width, their output to files
//    would create long lines, while others would not, which can be odd when
//    mixed together
export const wrapRows = (string) => wrapString(string, getScreenWidth())

const wrapString = (string, width) =>
  wrapAnsi(string, width, { hard: true, trim: false })
