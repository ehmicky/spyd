import { cwd as getCwd, stderr } from 'process'

import { validate, multipleValidOptions } from 'jest-validate'
import isInteractive from 'is-interactive'

import { omitBy } from '../utils/main.js'
import { getDefaultGroup } from '../ci/info.js'

import { getConfig } from './config.js'
import { addEnvVars } from './env.js'
import { normalizeOpts } from './normalize.js'

// Retrieve options/configuration
export const getOpts = async function(action, opts = {}) {
  const optsA = omitBy(opts, isUndefined)

  validateOpts(optsA)

  const optsB = await getConfig(optsA)
  const optsC = addEnvVars(optsB)

  validateOpts(optsC)
  const optsD = addDefaultOpts(optsC, action)

  const optsE = await normalizeOpts(optsD, action)
  return optsE
}

const isUndefined = function(value) {
  return value === undefined
}

// We need to do this twice because configuration loading needs to have
// `cwd` and `config` type checked, but it also adds new options.
const validateOpts = function(opts) {
  validate(opts, {
    exampleConfig: EXAMPLE_OPTS,
    recursiveBlacklist: ['run', 'report', 'progress', 'store'],
  })
}

const addDefaultOpts = function(opts, action) {
  return {
    ...DEFAULT_OPTS,
    context: action === 'show',
    runners: getRunners(opts),
    group: getDefaultGroup({ ...DEFAULT_OPTS, ...opts }),
    ...opts,
  }
}

const getRunners = function({ run }) {
  if (run === undefined) {
    return
  }

  return Object.keys(run)
}

const DEFAULT_OPTS = {
  colors: isInteractive(stderr),
  cwd: getCwd(),
  delta: true,
  diff: true,
  duration: 10,
  files: ['benchmarks.*', 'benchmarks/main.*'],
  info: false,
  limit: [],
  link: true,
  progress: { debug: {} },
  report: { debug: {} },
  run: { node: {} },
  save: false,
  store: { file: {} },
  system: '',
}

const VALID_TIMESTAMPS = [
  'yyyy-mm-dd',
  'yyyymmdd',
  'yyyy-mm-dd hh:mm:ss',
  'yyyy-mm-dd hh:mm:ssZ',
  'yyyy-mm-ddThh:mm:ss.sss',
  'yyyy-mm-ddThh:mm:ss.sssZ',
]

const VALID_BENCHMARK_DELTA = multipleValidOptions(true, 3, ...VALID_TIMESTAMPS)

const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  config: 'spyd.yml',
  context: true,
  delta: VALID_BENCHMARK_DELTA,
  diff: VALID_BENCHMARK_DELTA,
  group: multipleValidOptions('', '546'),
  insert: './README.md',
  limit: ['taskId=10'],
  output: './file.js',
  system: 'Windows 10',
  tasks: ['taskId'],
  variations: ['variationId'],
}
