import { updateDescription, END_DESCRIPTION } from '../preview/description.js'
import { sendAndReceive } from '../process/ipc.js'

import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

// Run user-defined logic: `before`, `main`, `after`
export const runMainEvents = async function (args) {
  if (args.stage === 'init') {
    return
  }

  await beforeCombination(args.server)
  const stats = await getCombinationStats(args)
  await afterCombination(args)
  return stats
}

// Run the user-defined `before` hooks
const beforeCombination = async function (server) {
  await sendAndReceive({ event: 'before' }, server)
}

const getCombinationStats = async function (args) {
  try {
    const minLoopDuration = await getMinLoopDuration(args)
    return await performMeasureLoop({ ...args, minLoopDuration })
  } catch (error) {
    await silentAfterCombination(args)
    throw error
  }
}

const silentAfterCombination = async function (args) {
  try {
    await afterCombination(args)
  } catch {}
}

// Run the user-defined `after` hooks
// `after` is always called, for cleanup, providing `before` completed.
const afterCombination = async function ({ server, previewState }) {
  await updateDescription(previewState, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
}
