import { validateFunction } from '../../config/normalize/validate/complex.js'
import { BUILTIN_RUNNERS } from '../main.js'

import { item } from './item.js'

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
  // Configuration definition for the plugin itself
  // Default: empty array
  shape: [
    {
      name: 'launch',
      required: true,
      validate: validateFunction,
    },
  ],
  // Properties of the `list` item shared by all plugins
  // Default: empty array
  item,
}
