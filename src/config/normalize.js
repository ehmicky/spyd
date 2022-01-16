import { mapValues } from '../utils/map.js'

import { runNormalizer } from './check.js'
import { runDag } from './dag/run.js'
import { CONFIG_PROPS } from './properties.js'

// Normalize configuration shape and do custom validation.
// Configuration normalizers can reference other configuration properties.
//  - We use a DAG to run those in the right order, while still trying to run
//    every async normalizer in parallel as much as possible
//  - This also allows definitions to be unordered, which is simpler
//     - For example, they can use named exports and be imported with a
//       wildcard import
//  - This also enables aggregating errors when multiple configuration
//    properties are invalid, as opposed to only the first one
export const normalizeConfig = async function (config, command, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  const configPropsFuncs = mapValues(CONFIG_PROPS, (configProp, name) =>
    normalizePropValue.bind(undefined, {
      configProp,
      name,
      config,
      command,
      configInfos: configInfosA,
    }),
  )
  const configProps = await runDag(configPropsFuncs)
  const configA = mergeConfigProps(configProps)
  return configA
}

const normalizePropValue = async function (
  {
    configProp: { commands, default: defaultValue, normalize },
    name,
    config,
    command,
    configInfos,
  },
  configPromises,
) {
  if (!commandHasProp(commands, command)) {
    return
  }

  const value = config[name]
  const args = [name, { configInfos, config: configPromises, command }]

  const valueA = await addDefaultValue(value, defaultValue, args)
  return await runPropNormalizer(valueA, normalize, args)
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

const addDefaultValue = async function (value, defaultValue, args) {
  if (value !== undefined) {
    return value
  }

  if (typeof defaultValue !== 'function') {
    return defaultValue
  }

  return await defaultValue(...args)
}

const runPropNormalizer = async function (value, normalize, args) {
  return value === undefined || normalize === undefined
    ? value
    : await runNormalizer(normalize, value, ...args)
}

const mergeConfigProps = function (configProps) {
  return Object.entries(configProps).reduce(setConfigProp, {})
}

const setConfigProp = function (config, [name, value]) {
  return value === undefined ? config : { ...config, [name]: value }
}
