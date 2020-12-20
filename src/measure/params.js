import { getMaxLoops } from './max_loops.js'
import { getEmpty } from './min_loop_duration.js'
import { getChildRepeat } from './repeat.js'

export const getParams = function ({
  runnerRepeats,
  state: { taskMedian, repeat, repeatInit },
}) {
  const maxLoops = getMaxLoops(taskMedian, repeat)
  const childRepeat = getChildRepeat(repeat, runnerRepeats)
  const empty = getEmpty(repeat, repeatInit, runnerRepeats)
  return { maxLoops, repeat: childRepeat, empty }
}
