import { PluginError } from '../../error/main.js'
import { normalizeConfig } from '../normalize/main.js'

import { isTopDefinition } from './config.js'

// Validate a plugin has the correct shape and normalize it
export const normalizePlugin = async function (
  plugin,
  mainDefinitions,
  topProps,
) {
  return await normalizeConfig(
    plugin,
    [...mainDefinitions, ...COMMON_DEFINITIONS],
    { context: { topProps }, ErrorType: PluginError },
  )
}

// Definitions shared by all plugins
const COMMON_DEFINITIONS = [
  {
    name: 'config.*.name',
    validate(name, { context: { topProps } }) {
      if (isTopDefinition(name, topProps)) {
        throw new Error(
          `must not redefine core configuration property "${name}".`,
        )
      }
    },
  },
]
