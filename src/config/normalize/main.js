import { UserError } from '../../error/main.js'
import { cleanObject } from '../../utils/clean.js'
import { mapValues } from '../../utils/map.js'

import { runNormalizer } from './check.js'
import { runDagAsync } from './dag/run.js'
import { getEntries } from './prop_path/get.js'
import { set } from './prop_path/set.js'
import { COMMANDS_PROPS } from './properties.js'

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
  const configProps = COMMANDS_PROPS[command]
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  const configPropsFuncs = mapValues(configProps, (configProp, query) =>
    normalizePropDeep.bind(undefined, {
      configProp,
      query,
      config,
      configInfos: configInfosA,
    }),
  )
  const configPropsA = await runDagAsync(configPropsFuncs)
  const configA = mergeConfigProps(configPropsA)
  const configB = cleanObject(configA)
  return configB
}

const normalizePropDeep = async function (
  { configProp, query, config, configInfos },
  get,
) {
  const getA = boundGet.bind(undefined, get)
  const entries = getEntries(config, query)
  return await Promise.all(
    entries.map((entry) =>
      normalizePropValue({ entry, configProp, configInfos, get: getA }),
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
}) {
  const opts = { name: query, path, configInfos, get }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  return await runPropNormalizer(valueA, normalize, opts)
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
