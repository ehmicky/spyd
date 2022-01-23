// eslint-disable-next-line no-restricted-imports, node/no-restricted-import
import { AssertionError } from 'assert'

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
  const configB = postNormalizeConfig(configA)
  return configB
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

// `AssertionErrors` are user-validation errors. Others are system errors.
const handleConfigError = function (error, ErrorType) {
  return error instanceof AssertionError
    ? wrapError(error, '', ErrorType)
    : error
}

// Perform normalization that is difficult to do with the main configuration
// logic
const postNormalizeConfig = function (config) {
  const configA = flattenTasks(config)
  return configA
}

const flattenTasks = function (config) {
  return config.tasks === undefined
    ? config
    : { ...config, tasks: config.tasks.flat() }
}
