import { cwd as getCwd } from 'process'

import { handleConfig } from './config.js'

export const getOpts = async function(opts = {}) {
  const optsA = await handleConfig(opts)

  const optsB = { ...DEFAULT_OPTS, ...optsA }

  const optsC = normalizeDuration(optsB)
  return optsC
}

const DEFAULT_OPTS = {
  duration: 10,
  cwd: getCwd(),
}

const normalizeDuration = function({ duration, ...opts }) {
  const durationA = duration * SECONDS_TO_NANOSECONDS
  return { ...opts, duration: durationA }
}

const SECONDS_TO_NANOSECONDS = 1e9
