import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { normalizeConfigSelectors } from '../select/normalize.js'

import { getPropCwd } from './cwd.js'
import { normalizeConfigProps } from './lib/main.js'

// Normalize configuration that is defined by users, which means it:
//  - Can use config selectors
//  - Use the correct `cwd` based on the current `spyd.*` file
export const normalizeUserConfig = async function ({
  config,
  definitions,
  opts,
  configInfos,
}) {
  const variableDefinitions = definitions.flatMap(normalizeConfigSelectors)
  const cwd = getPropCwd.bind(undefined, configInfos)
  return await normalizeConfig(config, variableDefinitions, { ...opts, cwd })
}

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  definitions,
  { context = {}, prefix, ErrorType = UserError, cwd },
) {
  try {
    return await normalizeConfigProps(config, definitions, {
      context,
      prefix,
      cwd,
    })
  } catch (error) {
    throw handleConfigError(error, ErrorType)
  }
}

// Distinguish user validation errors from system errors
const handleConfigError = function (error, ErrorType) {
  return error.validation ? wrapError(error, '', ErrorType) : error
}
