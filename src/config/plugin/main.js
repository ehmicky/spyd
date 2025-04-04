import {
  BaseError,
  PluginError,
  UnknownError,
  UserError,
} from '../../error/main.js'
import { normalizeReporters } from '../../report/config/main.js'
import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin/main.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin/main.js'
import { cleanObject } from '../../utils/clean.js'
import { bugs } from '../../utils/package.js'
import { PREFIX } from '../normalize/main.js'

import { ConsumerError, PluginError as PluginLibError } from './lib/error.js'
import { getPlugins } from './lib/main.js'

// Handle the configuration plugins: runners and reporters
export const normalizePluginsConfig = async ({
  config,
  command,
  context,
  cwd,
}) => {
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

const normalizePluginConfigs = async ({
  pluginType,
  pluginType: { name },
  config,
  context,
  cwd,
}) => {
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
      bugs,
    })
    const pluginInfosA = pluginInfos.map(normalizePluginInfo)
    return { [name]: pluginInfosA }
  } catch (error) {
    throw handlePluginsError(error)
  }
}

const normalizePluginInfo = ({ plugin, config }) =>
  cleanObject({ ...plugin, config })

const handlePluginsError = (error) =>
  BaseError.switch(error)
    .case(PluginLibError, PluginError)
    .case(ConsumerError, UserError)
    .default(UnknownError)
