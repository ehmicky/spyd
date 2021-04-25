import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { clearScreen, clearScreenFull } from '../report/tty.js'

// Start clearing the screen
export const startPreview = async function ({ quiet }) {
  if (quiet) {
    return
  }

  hideCursor()
  await clearScreenFull()
}

// Stop clearing the screen.
// Unless an error was thrown, we wait for the final reporter.report() before
// clearing.
// The last preview is kept as is when stopping the benchmarking
//  - This allows users to stop a benchmark without losing information,
//    including the duration that was left
//  - This is unlike other errors, which clear it
export const endPreview = async function ({ quiet }, error = {}) {
  if (quiet || error.name === 'StopError') {
    return
  }

  await clearScreen()
  showCursor()
}
