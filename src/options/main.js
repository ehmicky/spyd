import { cwd as getCwd } from 'process'

import { validate } from 'jest-validate'

import { omitBy } from '../utils.js'

import { getConfig } from './config.js'
import { normalizeOpts } from './normalize.js'

// Retrieve options/configuration
export const getOpts = async function(opts = {}) {
  const optsA = omitBy(opts, isUndefined)

  // We need to do this twice because configuration loading needs to have
  // `cwd` and `config` type checked, but it also adds new options.
  validate(optsA, { exampleConfig: EXAMPLE_OPTS })

  const optsB = await getConfig({ opts: optsA })

  validate(optsB, { exampleConfig: EXAMPLE_OPTS })
  const optsC = { ...DEFAULT_OPTS, ...optsB }

  const optsD = normalizeOpts(optsC)
  return optsD
}

const isUndefined = function(value) {
  return value === undefined
}

const DEFAULT_OPTS = {
  cwd: getCwd(),
  duration: 10,
  require: [],
}

export const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  config: 'spyd.json',
  file: 'benchmarks.js',
  require: ['ts-node/register'],
}
