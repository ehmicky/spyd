import { getMaxLoops } from './max_loops.js'

// Compute params to send to the measuring sample
export const getParams = function ({
  measureDuration,
  repeat,
  repeatLast,
  loopsLast,
}) {
  const maxLoops = getMaxLoops({
    measureDuration,
    repeat,
    repeatLast,
    loopsLast,
  })
  return { maxLoops, repeat }
}
