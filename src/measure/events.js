import { setDescription } from '../preview/update.js'
import { sendAndReceive } from '../process/ipc.js'

import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

// Run user-defined logic: `before`, `main`, `after`
export const runMainEvents = async function ({
  precisionTarget,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
  logsFd,
}) {
  if (stage === 'init') {
    return { previewConfig }
  }

  const previewConfigA = await beforeCombination(previewConfig, server)
  const { stats, previewConfig: previewConfigB } = await getCombinationStats({
    precisionTarget,
    previewConfig: previewConfigA,
    previewState,
    stopState,
    stage,
    server,
    logsFd,
  })
  const previewConfigC = await afterCombination(previewConfigB, server)
  return { stats, previewConfig: previewConfigC }
}

// Run the user-defined `before` hooks
const beforeCombination = async function (previewConfig, server) {
  await sendAndReceive({ event: 'before' }, server)
  const previewConfigA = setDescription(previewConfig, '')
  return previewConfigA
}

const getCombinationStats = async function ({
  precisionTarget,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
  logsFd,
}) {
  try {
    const minLoopDuration = await getMinLoopDuration(server, stage)
    return await performMeasureLoop({
      precisionTarget,
      previewConfig,
      previewState,
      stopState,
      stage,
      server,
      logsFd,
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
const afterCombination = async function (previewConfig, server) {
  const previewConfigA = setDescription(previewConfig, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
  return previewConfigA
}

const END_DESCRIPTION = 'Ending'
