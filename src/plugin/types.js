import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'
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
    selector: 'tasks.*',
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
    selector: 'reporter',
    configPrefix: 'reporter',
    modulePrefix: 'spyd-reporter-',
    builtins: REPORTERS,
  },
  {
    type: 'progress',
    varName: 'progresses',
    selector: 'progress',
    configPrefix: 'progress',
    modulePrefix: 'spyd-progress-',
    builtins: PROGRESS_REPORTERS,
  },
  {
    type: 'store',
    varName: 'stores',
    selector: 'store',
    configPrefix: 'store',
    modulePrefix: 'spyd-store-',
    builtins: STORES,
  },
]

// Configuration properties to remove after loading
export const PLUGIN_PROP_PREFIXES = ['runner', 'reporter', 'progress', 'store']
