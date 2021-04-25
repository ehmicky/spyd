import { updateDescription } from '../preview/update.js'
import { sendAndReceive } from '../process/ipc.js'

import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

// Run user-defined logic: `before`, `main`, `after`
export const runMainEvents = async function ({
  precisionTarget,
  previewConfig,
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
  const previewConfigA = await updateDescription(previewConfig, '')
  return previewConfigA
}

const getCombinationStats = async function ({
  precisionTarget,
  previewConfig,
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
      stopState,
      stage,
      server,
      logsFd,
      minLoopDuration,
    })
  } catch (error) {
    await silentAfterCombination(previewConfig, server)
    throw error
  }
}

const silentAfterCombination = async function (previewConfig, server) {
  try {
    await afterCombination(previewConfig, server)
  } catch {}
}

// Run the user-defined `after` hooks
// `after` is always called, for cleanup, providing `before` completed.
const afterCombination = async function (previewConfig, server) {
  const previewConfigA = await updateDescription(previewConfig, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
  const previewConfigB = await updateDescription(previewConfigA, '')
  return previewConfigB
}

const END_DESCRIPTION = 'Ending'
