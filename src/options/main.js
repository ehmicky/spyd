import { cwd as getCwd } from 'process'

import { validate } from 'jest-validate'

import { omitBy } from '../utils.js'

import { getConfig } from './config.js'

// Retrieve options/configuration
export const getOpts = async function(opts = {}) {
  const optsA = omitBy(opts, isUndefined)

  // We need to do this twice because configuration loading needs to have
  // `cwd` and `config` type checked, but it also adds new options.
  validate(optsA, { exampleConfig: EXAMPLE_OPTS })

  const optsB = await getConfig({ opts: optsA })

  const optsC = normalizeOpts(optsB)

  const optsD = normalizeDuration(optsC)
  return optsD
}

const isUndefined = function(value) {
  return value === undefined
}

const normalizeOpts = function(opts) {
  validate(opts, { exampleConfig: EXAMPLE_OPTS })

  const optsA = { ...DEFAULT_OPTS, ...opts }
  return optsA
}

const DEFAULT_OPTS = {
  cwd: getCwd(),
  duration: 10,
}

export const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  config: 'spyd.json',
  file: 'benchmarks.js',
}

// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function({ duration, ...opts }) {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new TypeError(`duration must be a positive number: ${duration}`)
  }

  const durationA = duration * SECONDS_TO_NANOSECONDS
  return { ...opts, duration: durationA }
}

const SECONDS_TO_NANOSECONDS = 1e9
