import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'

// All plugin types
export const PLUGIN_TYPES = [
  {
    // Shown in error message
    type: 'runner',
    // Internal variable name
    varName: 'runners',
    // Configuration property selecting the plugin
    property: 'runner',
    // Prefix of the configuration property configuring the plugin
    configPrefix: 'runner',
    // Prefix of the npm package
    modulePrefix: 'spyd-runner-',
    // Builtin plugins
    builtins: RUNNERS,
    // Configuration properties which can be overridden by each plugin
    configProps: ['tasks'],
  },
  {
    type: 'reporter',
    varName: 'reporters',
    property: 'reporter',
    configPrefix: 'reporter',
    modulePrefix: 'spyd-reporter-',
    builtins: REPORTERS,
    configProps: [
      'output',
      'colors',
      'showTitles',
      'showSystem',
      'showMetadata',
      'showPrecision',
      'showDiff',
    ],
  },
]

// Shared configurations are plugins when using the npm resolver.
// They are handled differently, i.e. require a separate type.
export const CONFIG_PLUGIN_TYPE = {
  type: 'config',
  modulePrefix: 'spyd-config-',
}

// Configuration properties to remove after loading
export const PLUGIN_PROP_PREFIXES = ['runner', 'reporter']
