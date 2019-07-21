import { cwd as getCwd } from 'process'

import { handleConfig } from './config.js'

export const getOpts = async function(opts = {}) {
  const optsA = await handleConfig(opts)

  return { ...DEFAULT_OPTS, ...optsA }
}

const DEFAULT_OPTS = {
  // Increasing it makes measurements more precise but makes run slower
  repeat: 1e3,
  // Increasing it makes run faster but makes it more likely for machine to
  // crash
  concurrency: 1e2,
  cwd: getCwd(),
}
