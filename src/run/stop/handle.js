import { once } from 'node:events'
import process from 'node:process'

import delay from 'delay'

import { addAction, removeAction } from '../preview/action.js'
import { STOP_DESCRIPTION, updateDescription } from '../preview/description.js'
import { updatePreview } from '../preview/update/main.js'

import { throwAbortError } from './error.js'
import { STOP_SIGNALS } from './signals.js'

// Listen for signals and trigger stop/abort logic
export const handleStop = async (stopState, previewState) => {
  await waitForStopSignals(stopState)
  await afterStop(stopState, previewState)

  await waitForAbort(stopState)
  await beforeAbort(previewState)

  await waitForStopSignals(stopState)
  await afterAbort(previewState)
}

const afterStop = async (stopState, previewState) => {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true
  removeAction(previewState, STOP_ACTION.name)
  await updateDescription(previewState, STOP_DESCRIPTION)
}

const beforeAbort = async (previewState) => {
  addAction(previewState, ABORT_ACTION)
  await updatePreview(previewState)
}

const afterAbort = async (previewState) => {
  removeAction(previewState, ABORT_ACTION.name)
  await updatePreview(previewState)
  throwAbortError()
}

const waitForStopSignals = async ({ cancelSignal }) => {
  await Promise.any(
    STOP_SIGNALS.map((stopSignal) =>
      once(process, stopSignal, { signal: cancelSignal }),
    ),
  )
}

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const waitForAbort = async ({ cancelSignal }) => {
  await delay(ABORT_DELAY, { signal: cancelSignal })
}

const ABORT_DELAY = 5e3

export const STOP_ACTION = {
  name: 'stop',
  key: 'Ctrl-C',
  explanation: 'Stop',
  order: 2,
}
const ABORT_ACTION = { ...STOP_ACTION, explanation: 'Abort' }
