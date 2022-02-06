import { amongCommands } from '../config/normalize/pick.js'
import {
  validateEmptyArray,
  validateFunction,
} from '../config/normalize/validate/complex.js'

import { BUILTIN_RUNNERS, DEFAULT_RUNNERS } from './main.js'
import { sharedProps } from './shared_props.js'

const pick = amongCommands(['dev', 'run'])

export const RUNNER_PLUGIN_TYPE = {
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
  // Configuration definition for the plugin itself
  // Default: empty array
  shape: [
    {
      name: 'launch',
      required: true,
      validate: validateFunction,
    },
  ],
  // Builtin plugins
  // Default: empty object
  builtins: BUILTIN_RUNNERS,
  // Configuration property selecting the plugin
  // Default: empty object
  selectProp: {
    pick,
    default: DEFAULT_RUNNERS,
    validate: validateEmptyArray,
  },
  // Configuration property configuring the plugin
  // Default: empty object
  configProp: {
    pick,
  },
  // Plugin properties shared by all plugins
  // Default: empty array
  sharedProps,
}
