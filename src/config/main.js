import { cwd as getCwd, stderr } from 'process'

import filterObj from 'filter-obj'
import isInteractive from 'is-interactive'
import { validate, multipleValidOptions } from 'jest-validate'

import { getDefaultMergeId } from '../merge/config.js'

import { addEnvVars } from './env.js'
import { getConfigFile } from './file.js'
import { preNormalizeConfig, normalizeConfig } from './normalize.js'

// Retrieve configuration
// `cwd` and `config` cannot be specified in the configuration file nor in
// environment variables
export const getConfig = async function (action, config = {}) {
  const { config: configPath, cwd, ...configA } = filterObj(config, isDefined)

  validateConfig({ config: configPath, cwd })

  const configB = await getConfigFile({ configPath, cwd, config: configA })
  const configC = addEnvVars(configB)

  validateConfig(configC)

  const configD = preNormalizeConfig(configC)
  const configE = addDefaultConfig(configD, action)

  const configF = await normalizeConfig(configE)
  return configF
}

const isDefined = function (key, value) {
  return value !== undefined
}

// We need to do this twice because configuration loading needs to have
// `cwd` and `config` type checked, but it also adds new properties.
const validateConfig = function (config) {
  validate(config, {
    exampleConfig: EXAMPLE_CONFIG,
    recursiveDenylist: RECURSIVE_PROPS,
  })
}

// Configuration properties using the dot notation
const RECURSIVE_PROPS = ['run', 'report', 'progress', 'store']

const addDefaultConfig = function (config, action) {
  return {
    ...DEFAULT_CONFIG,
    context: action === 'show',
    duration: getDefaultDuration(),
    merge: getDefaultMergeId({ ...DEFAULT_CONFIG, ...config }),
    ...config,
  }
}

const getDefaultDuration = function () {
  return isInteractive(stderr) ? -1 : 0
}

const DEFAULT_CONFIG = {
  output: '-',
  cwd: getCwd(),
  delta: true,
  diff: true,
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

const VALID_DELTA = multipleValidOptions(true, 3, ...VALID_TIMESTAMPS)

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  config: 'spyd.yml',
  context: true,
  delta: VALID_DELTA,
  diff: VALID_DELTA,
  duration: 10,
  merge: multipleValidOptions('', '546'),
  insert: './README.md',
  limit: ['taskId=10'],
  link: false,
  output: './file.js',
  system: 'Windows 10',
  tasks: ['taskId'],
  inputs: ['inputId'],
}
