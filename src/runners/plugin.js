import {
  validateEmptyArray,
  validateFunction,
} from '../config/normalize/validate/complex.js'

import { BUILTIN_RUNNERS, DEFAULT_RUNNERS } from './main.js'
import { sharedProps } from './shared_props.js'

export const RUNNER_PLUGIN_TYPE = {
  // Shown in error message
  type: 'runner',
  // Internal variable name
  varName: 'runners',
  // Configuration property configuring the plugin
  configProp: 'runnerConfig',
  // Prefix of the npm package
  modulePrefix: 'spyd-runner-',
  // Commands which use the plugin
  commands: ['dev', 'run'],
  // Whether this is a combination's dimension.
  // When false, this allows using custom prefixes.
  isCombinationDimension: true,
  // Builtin plugins
  builtins: BUILTIN_RUNNERS,
  // Configuration property selecting the plugin
  selectProp: {
    name: 'runner',
    default: DEFAULT_RUNNERS,
    validate: validateEmptyArray,
  },
  // Configuration definition for the plugin itself
  mainShape: [
    {
      name: 'launch',
      required: true,
      validate: validateFunction,
    },
  ],
  // Plugin properties shared by all plugins
  sharedProps,
}
