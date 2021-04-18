import {
  setDescription,
  setDelayedDescription,
} from '../preview/description.js'
import { sendAndReceive } from '../process/ipc.js'

import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

// Run user-defined logic: `before`, `main`, `after`
export const runMainEvents = async function ({
  precision,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
}) {
  if (stage === 'init') {
    return
  }

  await beforeCombination(previewState, server)
  const stats = await getCombinationStats({
    precision,
    previewConfig,
    previewState,
    stopState,
    stage,
    server,
  })
  await afterCombination(previewState, server)
  return stats
}

// Run the user-defined `before` hooks
const beforeCombination = async function (previewState, server) {
  await sendAndReceive({ event: 'before' }, server)
  setDescription(previewState)
}

const getCombinationStats = async function ({
  precision,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
}) {
  try {
    const minLoopDuration = await getMinLoopDuration(server, stage)
    return await performMeasureLoop({
      precision,
      previewConfig,
      previewState,
      stopState,
      stage,
      server,
      minLoopDuration,
    })
  } catch (error) {
    await silentAfterCombination(previewState, server)
    throw error
  }
}

const silentAfterCombination = async function (previewState, server) {
  try {
    await afterCombination(previewState, server)
  } catch {}
}

// Run the user-defined `after` hooks
// `after` is always called, for cleanup, providing `before` completed.
const afterCombination = async function (previewState, server) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
}

const END_DESCRIPTION = 'Ending...'
