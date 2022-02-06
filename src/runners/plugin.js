import {
  validateEmptyArray,
  validateFunction,
} from '../config/normalize/validate/complex.js'

import { BUILTIN_RUNNERS, DEFAULT_RUNNERS } from './main.js'
import { runnersTopDefinitions } from './top_definitions.js'

export const RUNNER_PLUGIN_TYPE = {
  // Shown in error message
  type: 'runner',
  // Internal variable name
  varName: 'runners',
  // Configuration property selecting the plugin
  selectProp: 'runner',
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
  // Default value for the `selectProp`
  selectPropDefault: DEFAULT_RUNNERS,
  // Additional configuration definition for `selectProp`
  selectPropDefinition: {
    validate: validateEmptyArray,
  },
  // Configuration definition for the plugin itself
  shape: [
    {
      name: 'launch',
      required: true,
      validate: validateFunction,
    },
  ],
  // Plugin properties shared by all plugins
  topDefinitions: runnersTopDefinitions,
}
