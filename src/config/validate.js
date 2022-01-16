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

const optionalArray = function (value) {
  return multipleValidOptions(value, [value])
}

// Configuration properties which can use selectors.
// `jest-validate` does not validate types recursively, so we need to do it
// later.
const optionalConfigSelectors = function (valueA, valueB) {
  return multipleValidOptions(valueA, { taskId: valueA, default: valueB })
}

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  inputs: { inputId: 'inputValue' },
  limit: optionalConfigSelectors(3, 10),
  merge: 'f0f13513-5267-43a9-a02a-60fdde0332d0',
  output: './file.js',
  precision: optionalConfigSelectors(3, 10),
  reporter: optionalArray('debug'),
  reporterConfig: { debug: { property: true } },
  runner: optionalArray('node'),
  runnerConfig: { node: { version: '8' } },
  select: optionalArray('task_id'),
  system: { os: 'linux', node_version: 'node_8' },
  tasks: optionalArray('./benchmark/tasks.js'),
  titles: { taskId: 'taskTitle' },
}
