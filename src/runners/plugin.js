import { amongCommands } from '../config/normalize/pick.js'
import {
  validateEmptyArray,
  validateFunction,
} from '../config/normalize/validate/complex.js'

import { BUILTIN_RUNNERS, DEFAULT_RUNNERS } from './main.js'
import { item } from './plugin_item.js'

export const RUNNER_PLUGIN_TYPE = {
  // Commands which can use this plugin type
  commands: ['dev', 'run'],
  // Name used:
  //  - As a default value for the selection property
  //  - As a default value for the configuration property appended with `Config`
  //  - In the return value
  //  - In error messages
  name: 'runner',
  // Prefix of the npm package
  modulePrefix: 'spyd-runner-',
  // When `true`, the plugin can be selected twice but with different configs
  // Default: `false`
  multiple: false,
  // Builtin plugins
  // Default: empty object
  builtins: BUILTIN_RUNNERS,
  // Configuration definition for the plugin itself
  // Default: empty array
  shape: [
    {
      name: 'launch',
      required: true,
      validate: validateFunction,
    },
  ],
  // Configuration property selecting and configuring the plugin
  // Default: empty object
  list: {
    pick: amongCommands(['dev', 'run']),
    default: DEFAULT_RUNNERS,
    validate: validateEmptyArray,
  },
  // Properties of the `list` item shared by all plugins
  // Default: empty array
  item,
}
