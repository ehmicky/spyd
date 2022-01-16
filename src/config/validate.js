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

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  inputs: { inputId: 'inputValue' },
  reporterConfig: { debug: { property: true } },
  runnerConfig: { node: { version: '8' } },
  system: { os: 'linux', node_version: 'node_8' },
  titles: { taskId: 'taskTitle' },
}
