import { getMaxLoops } from './max_loops.js'
import { getEmpty } from './min_loop_duration.js'
import { getChildRepeat } from './repeat.js'

export const getParams = function ({
  runnerRepeats,
  state: {
    stats: { median },
    repeat,
    repeatInit,
  },
}) {
  const maxLoops = getMaxLoops(median, repeat)
  const childRepeat = getChildRepeat(repeat, runnerRepeats)
  const empty = getEmpty(repeat, repeatInit, runnerRepeats)
  return { maxLoops, repeat: childRepeat, empty }
}
