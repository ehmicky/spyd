/* eslint-disable max-lines */
import pProps from 'p-props'

import { UserError } from '../../error/main.js'
import { cleanObject } from '../../utils/clean.js'
import { maybeFunction } from '../../utils/function.js'
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
  const configB = postNormalizeConfig(configA)
  const configC = cleanObject(configB)
  return configC
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
  configProp: { default: defaultValue, transform, compute },
  configInfos,
  get,
}) {
  const path = getPath(name)
  const opts = { name, path, configInfos, get }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  const valueB = await computeValue(valueA, compute, opts)
  return await transformValue(valueB, transform, opts)
}

const getPath = function (name) {
  return parse(name).map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
}

// Apply `default(opts)` which assigns a default value
const addDefaultValue = async function (value, defaultValue, opts) {
  return value === undefined ? await maybeFunction(defaultValue, opts) : value
}

// Apply `compute(opts)` which sets a value from the system, instead of the user
const computeValue = async function (value, compute, opts) {
  return compute === undefined ? value : await maybeFunction(compute, opts)
}

// Apply `transform(value)` which transforms the value set by the user
const transformValue = async function (value, transform, opts) {
  if (value === undefined || transform === undefined) {
    return value
  }

  const newValue = await transform(value, opts)
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
/* eslint-enable max-lines */
