import cliCursor from 'cli-cursor'

import { StopError } from '../../../error/main.js'
import {
  clearScreen,
  clearScreenFull,
  printToStdout,
} from '../../../report/tty.js'
import { updateReport } from '../results/main.js'
import { refreshPreview } from '../update/main.js'

import { startHandleKeypress, stopHandleKeypress } from './keypress.js'
import { startHandleResize, stopHandleResize } from './resize.js'
import { addResultPreviewState, getPreviewState } from './state.js'

// Initialize the preview before the result has been loaded.
export const initPreview = (config) => {
  const previewState = getPreviewState(config)
  printPreviewStarting(previewState)
  return previewState
}

// Loading combinations can be slow if the task is long to load.
// We print a message so the user knows something is happening.
// We print it before clearing the screen to avoid a screen flash.
const printPreviewStarting = ({ quiet }) => {
  if (quiet) {
    return
  }

  printToStdout('Starting...\n')
}

// Start the preview mode once the result has been loaded
export const startPreview = async ({
  newResult,
  result,
  sinceResult,
  noDimensions,
  previewState,
  config,
}) => {
  if (previewState.quiet) {
    return previewState
  }

  const previewStateA = addResultPreviewState({
    previewState,
    newResult,
    result,
    sinceResult,
    noDimensions,
    config,
  })
  await updateReport({ previewState: previewStateA })

  cliCursor.hide()
  await clearScreenFull()
  startHandleResize(previewStateA)
  startHandleKeypress(previewStateA)

  await refreshPreview(previewStateA)
  return previewStateA
}

// Stop the preview mode.
// Unless an error was thrown, we wait for the final reporter.report() before
// clearing.
// The last preview is kept as is when stopping the benchmarking
//  - This allows users to stop a benchmark without losing information,
//    including the duration that was left
//  - This is unlike other errors, which clear it
export const endPreview = async (previewState, error = {}) => {
  if (previewState.quiet) {
    return
  }

  stopHandleKeypress(previewState)
  stopHandleResize(previewState)

  if (!(error instanceof StopError)) {
    await clearScreen()
  }

  cliCursor.show()
}
