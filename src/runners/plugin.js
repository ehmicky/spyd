import { amongCommands } from '../config/normalize/pick.js'
import {
  validateEmptyArray,
  validateFunction,
} from '../config/normalize/validate/complex.js'

import { BUILTIN_RUNNERS, DEFAULT_RUNNERS } from './main.js'
import { sharedProps } from './shared_props.js'

const pick = amongCommands(['dev', 'run'])

export const RUNNER_PLUGIN_TYPE = {
  // Shown in error message
  type: 'runner',
  // Internal variable name
  varName: 'runners',
  // Prefix of the npm package
  modulePrefix: 'spyd-runner-',
  // Whether this is a combination's dimension.
  // When false, this allows using custom prefixes.
  isCombinationDimension: true,
  // Configuration definition for the plugin itself
  shape: [
    {
      name: 'launch',
      required: true,
      validate: validateFunction,
    },
  ],
  // Builtin plugins
  builtins: BUILTIN_RUNNERS,
  // Configuration property selecting the plugin
  selectProp: {
    name: 'runner',
    pick,
    default: DEFAULT_RUNNERS,
    validate: validateEmptyArray,
  },
  // Configuration property configuring the plugin
  configProp: {
    name: 'runnerConfig',
    pick,
  },
  // Plugin properties shared by all plugins
  sharedProps,
}
