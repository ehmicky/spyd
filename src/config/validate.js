import { multipleValidOptions } from 'jest-validate'

import { validateConfigProps } from '../utils/validate.js'

import { DEFAULT_CONFIG } from './default.js'

// Validate configuration against user typos.
// We need to validate twice: for the CLI flags then for the configuration file.
export const validateConfig = function (config) {
  validateConfigProps(config, {
    exampleConfig: EXAMPLE_CONFIG,
    recursiveDenylist: DYNAMIC_OBJECT_PROPS,
  })
}

// Object configuration properties whose properties are dynamic
const DYNAMIC_OBJECT_PROPS = [
  'runnerConfig',
  'reporterConfig',
  'system',
  'titles',
  'inputs',
]

const VALID_TIMESTAMPS = [
  'yyyy-mm-dd',
  'yyyymmdd',
  'yyyy-mm-dd hh:mm:ss',
  'yyyy-mm-dd hh:mm:ssZ',
  'yyyy-mm-ddThh:mm:ss.sss',
  'yyyy-mm-ddThh:mm:ss.sssZ',
]

const VALID_DELTA = multipleValidOptions(true, 3, ...VALID_TIMESTAMPS)

const optionalArray = function (value) {
  return multipleValidOptions(value, [value])
}

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  colors: false,
  cwd: '/path/to/repository',
  delta: VALID_DELTA,
  force: true,
  inputs: { inputId: 'inputValue' },
  limit: 10,
  merge: 'f0f13513-5267-43a9-a02a-60fdde0332d0',
  output: './file.js',
  quiet: true,
  reporter: optionalArray('debug'),
  reporterConfig: { debug: { property: true } },
  runner: optionalArray('node'),
  runnerConfig: { node: { version: '8' } },
  select: optionalArray('task_id'),
  showDiff: false,
  showMetadata: true,
  showSystem: true,
  since: VALID_DELTA,
  system: { os: 'linux', node_version: 'node_8' },
  tasks: optionalArray('./benchmark/tasks.js'),
  titles: { taskId: 'taskTitle' },
}
