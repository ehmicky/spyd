import process from 'process'

import { addAction, removeAction } from '../preview/action.js'
import { updateDescription, STOP_DESCRIPTION } from '../preview/description.js'
import { updatePreview } from '../preview/update.js'
import { waitForEvents, waitForDelay } from '../utils/timeout.js'

import { throwAbortError } from './error.js'
import { STOP_SIGNALS } from './signals.js'

// Listen for signals and trigger stop/abort logic
export const handleStop = async function (stopState, previewState) {
  await waitForStopSignals(stopState)
  await afterStop(stopState, previewState)

  await waitForAbort(stopState)
  await beforeAbort(previewState)

  await waitForStopSignals(stopState)
  await afterAbort(previewState)
}

const afterStop = async function (stopState, previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true
  removeAction(previewState, 'stop')
  await updateDescription(previewState, STOP_DESCRIPTION)
}

const beforeAbort = async function (previewState) {
  addAction(previewState, 'abort')
  await updatePreview(previewState)
}

const afterAbort = async function (previewState) {
  removeAction(previewState, 'abort')
  await updatePreview(previewState)
  throwAbortError()
}

const waitForStopSignals = async function ({ cancelSignal }) {
  await waitForEvents(process, STOP_SIGNALS, cancelSignal)
}

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const waitForAbort = async function ({ cancelSignal }) {
  await waitForDelay(ABORT_DELAY, cancelSignal)
}

const ABORT_DELAY = 5e3
