import { cwd as getCwd } from 'process'

import filterObj from 'filter-obj'
import { validate, multipleValidOptions } from 'jest-validate'

import { getDefaultGroup } from '../group/options.js'

import { getConfig } from './config.js'
import { addEnvVars } from './env.js'
import { preNormalizeOpts, normalizeOpts } from './normalize.js'

// Retrieve options/configuration
// `cwd` and `config` cannot be specified in the configuration file nor in
// environment variables
export const getOpts = async function (action, opts = {}) {
  const { config, cwd, ...optsA } = filterObj(opts, isDefined)

  validateOpts({ config, cwd })

  const optsB = await getConfig({ config, cwd, opts: optsA })
  const optsC = addEnvVars(optsB)

  validateOpts(optsC)

  const optsD = preNormalizeOpts(optsC)
  const optsE = addDefaultOpts(optsD, action)

  const optsF = await normalizeOpts(optsE, action)
  return optsF
}

const isDefined = function (key, value) {
  return value !== undefined
}

// We need to do this twice because configuration loading needs to have
// `cwd` and `config` type checked, but it also adds new options.
const validateOpts = function (opts) {
  validate(opts, {
    exampleConfig: EXAMPLE_OPTS,
    recursiveDenylist: RECURSIVE_OPTS,
  })
}

// Options using the dot notation
const RECURSIVE_OPTS = ['run', 'report', 'progress', 'store']

const addDefaultOpts = function (opts, action) {
  return {
    ...DEFAULT_OPTS,
    context: action === 'show',
    group: getDefaultGroup({ ...DEFAULT_OPTS, ...opts }),
    ...opts,
  }
}

const DEFAULT_OPTS = {
  output: '-',
  cwd: getCwd(),
  delta: true,
  diff: true,
  duration: 10,
  files: ['benchmarks.*', 'benchmarks/index.*'],
  info: false,
  limit: [],
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
  link: false,
  output: './file.js',
  system: 'Windows 10',
  tasks: ['taskId'],
  variations: ['variationId'],
}
