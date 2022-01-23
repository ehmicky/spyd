/* eslint-disable max-lines */
import pProps from 'p-props'

import { UserError } from '../../error/main.js'
import { cleanObject } from '../../utils/clean.js'
import { mapValues } from '../../utils/map.js'
import { then } from '../../utils/then.js'

import { runDagAsync } from './dag/run.js'
import { isParent } from './prop_path/compare.js'
import { list } from './prop_path/get.js'
import { parse } from './prop_path/parse.js'
import { set } from './prop_path/set.js'
// eslint-disable-next-line import/max-dependencies
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
  const queries = Object.keys(configProps)
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  const configPropsFuncs = mapValues(configProps, (configProp, query) =>
    normalizePropDeep.bind(undefined, {
      queries,
      configProp,
      query,
      config,
      configInfos: configInfosA,
    }),
  )
  const allConfigValues = await runDagAsync(configPropsFuncs)
  const configA = mergeConfigProps(allConfigValues)
  const configB = cleanObject(configA)
  return configB
}

const normalizePropDeep = async function (
  { queries, configProp, query, config, configInfos },
  get,
) {
  const configA = await setParentProps({ config, queries, query, get })
  const getA = boundGet.bind(undefined, get)
  const props = list(configA, query)
  return await pProps(props, (value, name) =>
    normalizePropValue({ value, name, configProp, configInfos, get: getA }),
  )
}

// Children properties await their parent, and use their parent normalized
// values
const setParentProps = async function ({ config, queries, query, get }) {
  const parentQueries = queries.filter((queryB) => isParent(query, queryB))
  const configValues = await Promise.all(parentQueries.map(get))
  return setConfigValues(configValues, config)
}

const boundGet = function (get, query) {
  try {
    const value = get(query)
    return then(value, (valueA) => unwrapValue(valueA, query))
  } catch (error) {
    handleGetUserError(error.message)
    throw error
  }
}

// When the query has a wildcard, `get()` returns an object with multiple values
// Otherwise, it returns the only value as is.
const unwrapValue = function (value, query) {
  return query in value ? value[query] : value
}

const handleGetUserError = function (message) {
  if (message.includes('Invalid name')) {
    throw new UserError(message)
  }
}

const normalizePropValue = async function ({
  value,
  name,
  configProp: { default: defaultValue, normalize },
  configInfos,
  get,
}) {
  const path = getPath(name)
  const opts = { name, path, configInfos, get }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  return await runPropNormalizer(valueA, normalize, opts)
}

const getPath = function (name) {
  return parse(name).map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
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

// Calls `normalize(value)` which transforms the value.
const runPropNormalizer = async function (value, normalize, opts) {
  if (value === undefined || normalize === undefined) {
    return value
  }

  const newValue = await normalize(value, opts)
  return newValue === undefined ? value : newValue
}

// We start from an empty object to:
//  - ensure only allowed properties are set
//  - there are no `undefined` values
const mergeConfigProps = function (allConfigValues) {
  const configValues = Object.values(allConfigValues)
  return setConfigValues(configValues, {})
}

const setConfigValues = function (configValues, config) {
  return configValues.flatMap(Object.entries).reduce(setConfigValue, config)
}

const setConfigValue = function (config, [name, value]) {
  return set(config, name, value)
}
/* eslint-enable max-lines */
