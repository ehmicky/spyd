import { getMaxLoops } from './max_loops.js'
import { getEmpty } from './min_loop_duration.js'
import { getChildRepeat } from './repeat.js'

// Compute params to send to the measuring sample
export const getParams = function ({
  runnerRepeats,
  repeat,
  repeatInit,
  measureDuration,
}) {
  const maxLoops = getMaxLoops(measureDuration)
  const childRepeat = getChildRepeat(repeat, runnerRepeats)
  const empty = getEmpty(repeat, repeatInit, runnerRepeats)
  return { maxLoops, repeat: childRepeat, empty }
}
