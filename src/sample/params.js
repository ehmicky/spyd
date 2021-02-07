import { getMaxLoops } from './max_loops.js'

// Compute params to send to the measuring sample
export const getParams = function ({
  measureDuration,
  repeat,
  repeatLast,
  sampleLoops,
}) {
  const maxLoops = getMaxLoops({
    measureDuration,
    repeat,
    repeatLast,
    sampleLoops,
  })
  return { maxLoops, repeat }
}
