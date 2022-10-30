import isErrorInstance from 'is-error-instance'

import { AnyError, PluginError, UserError } from '../../error/main.js'
import { normalizeReporters } from '../../report/config/main.js'
import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin/main.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin/main.js'
import { cleanObject } from '../../utils/clean.js'
import { PREFIX } from '../normalize/main.js'

import { getPlugins } from './lib/main.js'

// Handle the configuration plugins: runners and reporters
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  cwd,
}) {
  const allPluginsEntries = await Promise.all(
    PLUGIN_TYPES.map((pluginType) =>
      normalizePluginConfigs({ pluginType, config, context, cwd }),
    ),
  )
  const configA = Object.assign({}, config, ...allPluginsEntries)
  const configB = normalizeReporters(configA, command)
  return configB
}

const PLUGIN_TYPES = [RUNNER_PLUGIN_TYPE, REPORTER_PLUGIN_TYPE]

const normalizePluginConfigs = async function ({
  pluginType,
  pluginType: { name },
  config,
  context,
  cwd,
}) {
  const pluginConfigs = config[name]

  if (pluginConfigs === undefined) {
    return {}
  }

  try {
    const pluginInfos = await getPlugins(pluginConfigs, {
      ...pluginType,
      pluginProp: 'id',
      sharedConfig: config,
      sharedConfigName: '.',
      context,
      cwd,
      prefix: PREFIX,
    })
    const pluginInfosA = pluginInfos.map(normalizePluginInfo)
    return { [name]: pluginInfosA }
  } catch (cause) {
    throw handlePluginsError(cause)
  }
}

const normalizePluginInfo = function ({ plugin, config }) {
  return cleanObject({ ...plugin, config })
}

// Translate error classes from the plugins library to error classes from this
// library
const handlePluginsError = function (cause) {
  const ErrorClass = ERROR_MAP[getName(cause)]
  return new ErrorClass('', { cause })
}

const getName = function (error) {
  return isErrorInstance(error) && error.name in ERROR_MAP
    ? error.name
    : DEFAULT_ERROR_NAME
}

const ERROR_MAP = {
  UnknownError: AnyError,
  UserError: AnyError,
  PluginError,
  ConsumerError: UserError,
}

const DEFAULT_ERROR_NAME = 'UnknownError'
