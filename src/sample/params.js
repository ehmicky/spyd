import { getMaxLoops } from './max_loops.js'

// Compute params to send to the measuring sample
export const getParams = function ({ measureDuration, repeat, loopsLast }) {
  const maxLoops = getMaxLoops(measureDuration, loopsLast)
  return { maxLoops, repeat }
}
