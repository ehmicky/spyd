import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { clearScreen, clearScreenFull } from '../report/tty.js'

// Start clearing the screen
export const startPreview = async function (quiet) {
  if (quiet) {
    return
  }

  hideCursor()
  await clearScreenFull()
}

// Stop clearing the screen
// Unless an error was thrown, we wait for the final reporter.report() before
// clearing
export const endPreview = async function (quiet) {
  if (quiet) {
    return
  }

  await clearScreen()
  showCursor()
}
