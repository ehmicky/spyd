import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'
import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'
import { STORES } from '../store/stores/main.js'

// All plugin types
export const PLUGIN_TYPES = [
  {
    type: 'runner',
    selector: 'tasks.*',
    prefix: 'spyd-runner-',
    builtins: RUNNERS,
  },
  {
    type: 'reporter',
    selector: 'reporters',
    prefix: 'spyd-reporter-',
    builtins: REPORTERS,
  },
  {
    type: 'progress',
    selector: 'progresses',
    prefix: 'spyd-progress-',
    builtins: PROGRESS_REPORTERS,
  },
  {
    type: 'store',
    selector: 'stores',
    prefix: 'spyd-store-',
    builtins: STORES,
  },
]
