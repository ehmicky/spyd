import { cwd as getCwd, stderr } from 'process'

import { validate, multipleValidOptions } from 'jest-validate'
import isInteractive from 'is-interactive'

import { omitBy } from '../utils/main.js'
import { normalizeStore } from '../store/options.js'

import { getConfig } from './config.js'
import { addEnvVars } from './env.js'
import { normalizeOpts } from './normalize.js'
import { loadAllPlugins } from './plugins.js'

// Retrieve options/configuration
export const getOpts = async function(opts = {}) {
  const optsA = omitBy(opts, isUndefined)

  validateOpts(optsA)

  const optsB = await getConfig({ opts: optsA })
  const optsC = addEnvVars(optsB)

  validateOpts(optsC)
  const optsD = { ...DEFAULT_OPTS, ...optsC }

  const optsE = normalizeOpts(optsD)
  const optsF = await loadAllPlugins(optsE)
  const optsG = await normalizeStore(optsF)
  return optsG
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

const DEFAULT_OPTS = {
  files: ['benchmarks.*', 'benchmarks/main.*'],
  cwd: getCwd(),
  duration: 10,
  colors: isInteractive(stderr),
  verbose: false,
  link: true,
  system: false,
  save: false,
  run: { node: {} },
  report: { debug: {} },
  progress: { debug: {} },
  store: { file: {} },
  show: true,
  diff: true,
  remove: true,
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
  config: 'spyd.json',
  tasks: ['taskId'],
  variations: ['variationId'],
  job: '546',
  env: 'Windows 10',
  output: './file.js',
  insert: './README.md',
  show: VALID_BENCHMARK_DELTA,
  diff: VALID_BENCHMARK_DELTA,
  remove: VALID_BENCHMARK_DELTA,
}
