/* eslint-disable max-lines */
import { UserError } from '../../error/main.js'
import { cleanObject } from '../../utils/clean.js'
import { mapValues } from '../../utils/map.js'

import { runNormalizer } from './check.js'
import { runDagAsync } from './dag/run.js'
import { getEntries } from './prop_path/get.js'
import { set } from './prop_path/set.js'
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
  const configPropsFuncs = mapValues(CONFIG_PROPS, (configProp, query) =>
    normalizePropDeep.bind(undefined, {
      configProp,
      query,
      config,
      command,
      configInfos: configInfosA,
    }),
  )
  const configProps = await runDagAsync(configPropsFuncs)
  const configA = mergeConfigProps(configProps)
  const configB = cleanObject(configA)
  return configB
}

const normalizePropDeep = async function (
  { configProp, configProp: { commands }, query, config, command, configInfos },
  get,
) {
  if (!commandHasProp(commands, command)) {
    return []
  }

  const getA = boundGet.bind(undefined, get)
  const entries = getEntries(config, query)
  return await Promise.all(
    entries.map((entry) =>
      normalizePropValue({
        entry,
        configProp,
        configInfos,
        get: getA,
        command,
      }),
    ),
  )
}

const boundGet = function (get, query) {
  try {
    return get(query)
  } catch (error) {
    handleGetUserError(error.message)
    throw error
  }
}

const handleGetUserError = function (message) {
  if (message.includes('Invalid name')) {
    throw new UserError(message)
  }
}

const normalizePropValue = async function ({
  entry: { value, query, path },
  configProp: { default: defaultValue, normalize },
  configInfos,
  get,
  command,
}) {
  const opts = { name: query, path, configInfos, get, command }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  return await runPropNormalizer(valueA, normalize, opts)
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

const addDefaultValue = async function (value, defaultValue, opts) {
  if (value !== undefined) {
    return value
  }

  if (typeof defaultValue !== 'function') {
    return defaultValue
  }

  return await defaultValue(opts)
}

const runPropNormalizer = async function (value, normalize, opts) {
  return value === undefined || normalize === undefined
    ? value
    : await runNormalizer(normalize, value, opts)
}

const mergeConfigProps = function (configProps) {
  return Object.entries(configProps).reduce(setConfigProp, {})
}

const setConfigProp = function (config, [query, value]) {
  return set(config, query, value[0])
}
/* eslint-enable max-lines */
