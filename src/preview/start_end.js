import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { clearScreen, clearScreenFull, printToTty } from '../report/tty.js'

// Loading combinations can be slow if the task is long to load.
// We print a message so the user knows something is happening.
// We print it before clearing the screen to avoid a screen flash.
export const printPreviewStarting = function ({ quiet }) {
  if (quiet) {
    return
  }

  printToTty('Starting...\n')
}

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
  if (quiet) {
    return
  }

  if (error.name !== 'StopError') {
    await clearScreen()
  }

  showCursor()
}
