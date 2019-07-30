import { cwd as getCwd } from 'process'

import { handleConfig } from './config.js'

export const getOpts = async function(opts = {}) {
  const optsA = await handleConfig(opts)

  return { ...DEFAULT_OPTS, ...optsA }
}

const DEFAULT_OPTS = {
  duration: 10,
  cwd: getCwd(),
}
