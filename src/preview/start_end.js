import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { clearScreen, clearScreenFull } from '../report/tty.js'

import { setDelayedDescription } from './set.js'

// Start clearing the screen
export const startPreview = async function ({ quiet }, previewState) {
  if (quiet) {
    return
  }

  hideCursor()
  await clearScreenFull()

  setDelayedDescription(previewState, START_DESCRIPTION)
}

const START_DESCRIPTION = 'Starting...'

// Stop clearing the screen
export const endPreview = async function (quiet) {
  if (quiet) {
    return
  }

  await clearScreen()
  showCursor()
}
