import filterObj from 'filter-obj'
import { validate, multipleValidOptions } from 'jest-validate'

import { DEFAULT_CONFIG } from './default.js'

// Validate configuration against user typos.
// We need to validate twice: for the CLI flags then for the configuration file.
export const validateConfig = function (config) {
  const configA = ignoreDynamicKeyProps(config)
  validate(configA, {
    exampleConfig: EXAMPLE_CONFIG,
    recursiveDenylist: DYNAMIC_OBJECT_PROPS,
  })
}

const ignoreDynamicKeyProps = function (config) {
  return filterObj(config, isStaticKeyProp)
}

const isStaticKeyProp = function (key) {
  return DYNAMIC_KEY_PROPS.every(
    (propName) => !key.startsWith(propName) || key === propName,
  )
}

// Configuration properties whose key is dynamic but starts with a known prefix
const DYNAMIC_KEY_PROPS = ['runner', 'reporter', 'store']
// Object configuration properties whose properties are dynamic
const DYNAMIC_OBJECT_PROPS = ['titles', 'inputs']

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
  cwd: '/path/to/repository',
  config: './benchmark/spyd.yml',
  extend: './shared_spyd.yml',
  tasks: './benchmark/tasks.js',
  runner: optionalArray('node'),
  reporter: optionalArray('debug'),
  store: optionalArray('file'),
  limit: optionalArray('task_id=10'),
  preview: false,
  debug: false,
  output: './file.js',
  insert: './README.md',
  colors: false,
  showDiff: false,
  showMetadata: true,
  include: optionalArray('task_id'),
  exclude: optionalArray('task_id'),
  delta: VALID_DELTA,
  since: VALID_DELTA,
  titles: { taskId: 'taskTitle' },
  inputs: { inputId: 'inputValue' },
}
