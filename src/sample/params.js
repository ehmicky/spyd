import { getMaxLoops } from './max_loops.js'

// Compute params to send to the measuring sample
export const getParams = function ({ measureDurationLast, repeat, loopsLast }) {
  const maxLoops = getMaxLoops(measureDurationLast, loopsLast)
  return { maxLoops, repeat }
}
