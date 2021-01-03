import filterObj from 'filter-obj'
import { validate, multipleValidOptions } from 'jest-validate'

import { DEFAULT_CONFIG } from './default.js'

// Validate configuration against user typos.
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
const DYNAMIC_KEY_PROPS = ['runner', 'reporter', 'progress', 'store']
// Object configuration properties whose properties are dynamic
const DYNAMIC_OBJECT_PROPS = ['tasks', 'titles', 'inputs']

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
  config: './benchmark/spyd.yml',
  extend: './shared_spyd.yml',
  tasks: multipleValidOptions({ node: '*.task.js' }, { node: ['*.task.js'] }),
  reporter: multipleValidOptions('debug', ['debug']),
  progress: multipleValidOptions('debug', ['debug']),
  store: multipleValidOptions('file', ['file']),
  debug: false,
  merge: multipleValidOptions('', '546'),
  output: './file.js',
  insert: './README.md',
  limit: ['task_id=10'],
  colors: false,
  context: true,
  link: false,
  include: ['task_id'],
  exclude: ['task_id'],
  delta: VALID_DELTA,
  diff: VALID_DELTA,
  since: VALID_DELTA,
  titles: { taskId: 'taskTitle' },
  inputs: { inputName: 'inputValue' },
}
