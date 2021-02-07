import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { clearScreen } from '../report/tty.js'

// Initialize preview mode
export const initPreview = function () {
  hideCursor()
}

// Finish preview mode
export const finishPreview = async function (quiet) {
  if (quiet) {
    return
  }

  showCursor()
  await clearScreen()
}
