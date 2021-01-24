import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'
import { STORES } from '../store/stores/main.js'

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
  },
  {
    type: 'reporter',
    varName: 'reporters',
    property: 'reporter',
    configPrefix: 'reporter',
    modulePrefix: 'spyd-reporter-',
    builtins: REPORTERS,
  },
  {
    type: 'store',
    varName: 'stores',
    property: 'store',
    configPrefix: 'store',
    modulePrefix: 'spyd-store-',
    builtins: STORES,
  },
]

// Configuration properties to remove after loading
export const PLUGIN_PROP_PREFIXES = ['runner', 'reporter', 'store']
