import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { reportStart, reportEnd } from '../report/main.js'
import { clearScreen, clearScreenFull, printToTty } from '../report/tty.js'

import { startHandleKeypress, stopHandleKeypress } from './keypress.js'
import { startHandleResize, stopHandleResize } from './resize.js'
import { updateReport } from './results.js'
import { getPreviewState } from './state.js'
import { refreshPreview } from './update.js'

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
export const startPreview = async function (config, result, previous) {
  if (config.quiet) {
    return { config, previewState: { quiet: true } }
  }

  const { config: configA, previewState } = await startPreviewReport(
    config,
    result,
    previous,
  )

  hideCursor()
  await clearScreenFull()
  startHandleResize(previewState)
  startHandleKeypress(previewState)

  await refreshPreview(previewState)
  return { config: configA, previewState }
}

const startPreviewReport = async function (config, result, previous) {
  const { config: configA, result: resultA } = await reportStart(
    result,
    previous,
    config,
  )
  const previewState = getPreviewState(resultA, configA)
  await updateReport({ previewState })
  return { config: configA, previewState }
}

// Stop clearing the screen.
// Unless an error was thrown, we wait for the final reporter.report() before
// clearing.
// The last preview is kept as is when stopping the benchmarking
//  - This allows users to stop a benchmark without losing information,
//    including the duration that was left
//  - This is unlike other errors, which clear it
export const endPreview = async function (previewState, config, error = {}) {
  if (previewState.quiet) {
    return
  }

  stopHandleKeypress(previewState)
  stopHandleResize(previewState)

  if (error.name !== 'StopError') {
    await clearScreen()
  }

  showCursor()

  await reportEnd(config)
}
