import { validate, multipleValidOptions } from 'jest-validate'

import { DEFAULT_CONFIG } from './default.js'

// Validate configuration against user typos.
export const validateConfig = function (config) {
  validate(config, {
    exampleConfig: EXAMPLE_CONFIG,
    recursiveDenylist: DYNAMIC_PROPS,
  })
}

// Configuration properties with a variable property name
const DYNAMIC_PROPS = [
  'tasks',
  'runner',
  'reporter',
  'progress',
  'store',
  'titles',
  'input',
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

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  config: './benchmark/spyd.yml',
  extend: './shared_spyd.yml',
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
}
