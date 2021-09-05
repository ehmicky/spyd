import { getStatsTables } from './stats.js'

// Debugging reporter only meant for development purpose
const reportTerminal = function ({ combinations, screenWidth }) {
  return getStatsTables(combinations, screenWidth)
}

export const debug = { reportTerminal, capabilities: { debugStats: true } }
