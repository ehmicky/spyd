import omit from 'omit.js'

import { runNormalizer } from './check.js'
import { CONFIG_PROPS } from './properties.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config, command, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return Object.entries(CONFIG_PROPS).reduce(
    (configA, [name, configProp]) =>
      normalizePropConfig(
        { config: configA, name, command, configInfos: configInfosA },
        configProp,
      ),
    config,
  )
}

const normalizePropConfig = function (
  { config, name, command, configInfos },
  configProp,
) {
  const value = normalizePropValue(
    { config, name, command, configInfos },
    configProp,
  )

  if (value === undefined) {
    return name in config ? omit.default(config, [name]) : config
  }

  return { ...config, [name]: value }
}

const normalizePropValue = function (
  { config, name, command, configInfos },
  { commands, default: defaultValue, normalize },
) {
  if (!commandHasProp(commands, command)) {
    return
  }

  const value = config[name]
  const args = [name, { configInfos, config, command }]

  const valueA = addDefaultValue(value, defaultValue, args)

  return valueA === undefined || normalize === undefined
    ? valueA
    : runNormalizer(normalize, valueA, ...args)
}

// All config properties can be specified in `spyd.yml` (unlike CLI flags), for
// any commands.
// Therefore, we need to filter them out depending on the current command.
const commandHasProp = function (commands, command) {
  return COMMAND_GROUPS[commands].includes(command)
}

// Every group of commands
const COMMAND_GROUPS = {
  // All commands
  all: ['dev', 'remove', 'run', 'show'],
  // Commands that can run combinations
  combinations: ['dev', 'run'],
  // Commands that use main deltas
  delta: ['remove', 'show'],
  // Commands that use history
  history: ['remove', 'run', 'show'],
  // `remove` command
  remove: ['remove'],
  // Commands that report results
  report: ['remove', 'run', 'show'],
  // `run` command
  run: ['run'],
  // Commands that can select combinations
  select: ['dev', 'remove', 'run', 'show'],
}

const addDefaultValue = function (value, defaultValue, args) {
  if (value !== undefined) {
    return value
  }

  return typeof defaultValue === 'function'
    ? defaultValue(...args)
    : defaultValue
}
