import { cwd as getCwd } from 'process'

import { validate } from 'jest-validate'

import { omitBy } from '../utils/main.js'

import { getConfig } from './config.js'
import { normalizeOpts } from './normalize.js'

// Retrieve options/configuration
export const getOpts = async function(opts = {}) {
  const optsA = omitBy(opts, isUndefined)

  validateOpts(optsA)

  const optsB = await getConfig({ opts: optsA })

  validateOpts(optsB)
  const optsC = { ...DEFAULT_OPTS, ...optsB }

  const optsD = await normalizeOpts(optsC)
  return optsD
}

const isUndefined = function(value) {
  return value === undefined
}

// We need to do this twice because configuration loading needs to have
// `cwd` and `config` type checked, but it also adds new options.
const validateOpts = function(opts) {
  validate(opts, {
    exampleConfig: EXAMPLE_OPTS,
    recursiveBlacklist: ['run', 'report', 'progress'],
  })
}

const DEFAULT_OPTS = {
  files: ['benchmarks.*', 'benchmarks/main.*'],
  cwd: getCwd(),
  duration: 10,
  run: { node: {} },
  report: {},
  progress: { debug: {} },
  verbose: false,
  link: true,
  system: false,
  save: false,
}

const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  config: 'spyd.json',
  tasks: ['taskId'],
  variations: ['variationId'],
  output: './file.js',
  insert: './README.md',
  data: './spyd',
}
