import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin.js'

// All plugin types
export const PLUGIN_TYPES = {
  [RUNNER_PLUGIN_TYPE.type]: RUNNER_PLUGIN_TYPE,
  [REPORTER_PLUGIN_TYPE.type]: REPORTER_PLUGIN_TYPE,
}

export const PLUGIN_TYPES_ARRAY = Object.values(PLUGIN_TYPES)
