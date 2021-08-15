import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { clearScreen, clearScreenFull, printToStdout } from '../report/tty.js'

import { startHandleKeypress, stopHandleKeypress } from './keypress.js'
import { startHandleResize, stopHandleResize } from './resize.js'
import { updateReport } from './results.js'
import { addResultPreviewState } from './state.js'
import { refreshPreview } from './update.js'

// Loading combinations can be slow if the task is long to load.
// We print a message so the user knows something is happening.
// We print it before clearing the screen to avoid a screen flash.
export const printPreviewStarting = function ({ quiet }) {
  if (quiet) {
    return
  }

  printToStdout('Starting...\n')
}

// Start clearing the screen
export const startPreview = async function (
  result,
  historyResult,
  previewState,
) {
  if (previewState.quiet) {
    return previewState
  }

  const previewStateA = addResultPreviewState(
    previewState,
    result,
    historyResult,
  )
  await updateReport({ previewState: previewStateA })

  hideCursor()
  await clearScreenFull()
  startHandleResize(previewStateA)
  startHandleKeypress(previewStateA)

  await refreshPreview(previewStateA)
  return previewStateA
}

// Stop clearing the screen.
// Unless an error was thrown, we wait for the final reporter.report() before
// clearing.
// The last preview is kept as is when stopping the benchmarking
//  - This allows users to stop a benchmark without losing information,
//    including the duration that was left
//  - This is unlike other errors, which clear it
export const endPreview = async function (previewState, error = {}) {
  if (previewState.quiet) {
    return
  }

  stopHandleKeypress(previewState)
  stopHandleResize(previewState)

  if (error.name !== 'StopError') {
    await clearScreen()
  }

  showCursor()
}
