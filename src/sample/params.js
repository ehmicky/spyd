import { getMaxLoops } from './max_loops.js'

// Compute params to send to the measuring sample
export const getParams = function ({ measureDuration, repeat }) {
  const maxLoops = getMaxLoops(measureDuration)
  return { maxLoops, repeat }
}
