import { BUILTIN_RUNNERS } from '../main.js'

import { shared } from './shared.js'

export const RUNNER_PLUGIN_TYPE = {
  // Top-level property name, used in error messages
  // Default: 'plugins'
  name: 'runner',
  // Prefix of the npm package
  // Default: none
  modulePrefix: 'spyd-runner',
  // When `true`, the plugin can be selected twice but with different configs
  // Default: `false`
  duplicates: false,
  // Builtin plugins
  // Default: empty object
  builtins: BUILTIN_RUNNERS,
  // Configuration rule for the plugin itself
  // Default: empty array
  shape: new Set([
    {
      name: 'launch',
      required: true,
      schema: { typeof: 'function', errorMessage: 'must be a function' },
    },
  ]),
  // Plugin configuration properties shared by all plugins
  // Default: empty array
  shared,
}
