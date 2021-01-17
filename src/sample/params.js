import { getMaxLoops } from './max_loops.js'
import { getEmpty } from './min_loop_duration.js'

// Compute params to send to the measuring sample
export const getParams = function ({
  runnerRepeats,
  repeat,
  repeatInit,
  measureDuration,
}) {
  const maxLoops = getMaxLoops(measureDuration)
  const empty = getEmpty(repeat, repeatInit, runnerRepeats)
  return { maxLoops, repeat, empty }
}
