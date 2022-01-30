import { wrapError } from '../../error/wrap.js'

import { normalizeConfigProps } from './lib/main.js'
import { DEFINITIONS } from './prop_defs.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  { command, configInfos, ErrorType },
) {
  const context = getContext(command, configInfos)
  const configA = await safeNormalizeConfig(config, context, ErrorType)
  return configA
}

const getContext = function (command, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return { command, configInfos: configInfosA }
}

const safeNormalizeConfig = async function (config, context, ErrorType) {
  try {
    return await normalizeConfigProps(config, DEFINITIONS, { context })
  } catch (error) {
    throw handleConfigError(error, ErrorType)
  }
}

// Distinguish user validation errors from system errors
const handleConfigError = function (error, ErrorType) {
  return error.validation ? wrapError(error, '', ErrorType) : error
}
