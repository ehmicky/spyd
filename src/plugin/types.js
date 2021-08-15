import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'

// All plugin types
export const PLUGIN_TYPES = {
  runner: {
    // Shown in error message
    type: 'runner',
    // Internal variable name
    varName: 'runners',
    // Configuration property selecting the plugin
    selectProp: 'runner',
    // Configuration property configuring the plugin
    configProp: 'runnerConfig',
    // Configuration properties which can be overridden by each plugin
    topProps: ['tasks'],
    // Prefix of the npm package
    modulePrefix: 'spyd-runner-',
    // Builtin plugins
    builtins: RUNNERS,
  },
  reporter: {
    type: 'reporter',
    varName: 'reporters',
    selectProp: 'reporter',
    configProp: 'reporterConfig',
    topProps: [
      'output',
      'colors',
      'showTitles',
      'showSystem',
      'showMetadata',
      'showPrecision',
      'showDiff',
    ],
    modulePrefix: 'spyd-reporter-',
    builtins: REPORTERS,
  },
}
export const PLUGIN_TYPES_ARRAY = Object.values(PLUGIN_TYPES)

// Shared configurations are plugins when using the npm resolver.
// They are handled differently, i.e. require a separate type.
export const CONFIG_PLUGIN_TYPE = {
  type: 'config',
  modulePrefix: 'spyd-config-',
}
