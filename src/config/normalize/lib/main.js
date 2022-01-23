/* eslint-disable max-lines */
import pProps from 'p-props'
import pReduce from 'p-reduce'

import { UserError } from '../../../error/main.js'
import { cleanObject } from '../../../utils/clean.js'
import { maybeFunction } from '../../../utils/function.js'
import { mapValues } from '../../../utils/map.js'
import { then } from '../../../utils/then.js'

import { runDagAsync } from './dag/run.js'
import { isParent } from './prop_path/compare.js'
import { list } from './prop_path/get.js'
import { parse } from './prop_path/parse.js'
// eslint-disable-next-line import/max-dependencies
import { set } from './prop_path/set.js'

// Normalize configuration shape and do custom validation.
// Each configuration property declares a definition object with the sets of
// normalization and validation to perform.
// Configuration normalizers can reference other configuration properties.
//  - We use a DAG to run those in the right order, while still trying to run
//    every async normalizer in parallel as much as possible
//  - This also allows definitions to be unordered, which is simpler
//     - For example, they can use named exports and be imported with a
//       wildcard import
//  - This also enables aggregating errors when multiple configuration
//    properties are invalid, as opposed to only the first one
// TODO: abstract this function to its own library
export const normalizeConfigProps = async function (
  config,
  definitions,
  configInfos,
) {
  const queries = Object.keys(definitions)
  const definitionsFuncs = mapValues(definitions, (definitionList, query) =>
    normalizePropDeep.bind(undefined, {
      queries,
      definitionList,
      query,
      config,
      configInfos,
    }),
  )
  const allConfigValues = await runDagAsync(definitionsFuncs)
  const configA = mergeConfigProps(allConfigValues)
  const configB = cleanObject(configA)
  return configB
}

const normalizePropDeep = async function (
  { queries, definitionList, query, config, configInfos },
  get,
) {
  const configA = await setParentProps({ config, queries, query, get })
  const getA = boundGet.bind(undefined, get)
  const props = list(configA, query)
  return await pProps(props, (value, name) =>
    applyDefinitionList({
      value,
      name,
      definitionList,
      configInfos,
      get: getA,
    }),
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

// Properties definitions can optionally be an array.
// This is useful either:
//  - when combined with `condition()`
//  - when the default order is not convenient, e.g. when `validate()` must be
//    run after `normalize()`
const applyDefinitionList = async function ({
  value,
  name,
  definitionList,
  configInfos,
  get,
}) {
  const path = getPath(name)
  const opts = { name, path, configInfos, get }
  const definitionListA = Array.isArray(definitionList)
    ? definitionList
    : [definitionList]
  const { value: valueA, skipped } = await pReduce(
    definitionListA,
    (memo, definition) => applyDefinition(memo, definition, opts),
    { value, skipped: true },
  )
  return skipped ? undefined : valueA
}

const getPath = function (name) {
  return parse(name).map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
}

const applyDefinition = async function (
  { value, skipped },
  { condition, default: defaultValue, compute, transform },
  opts,
) {
  if (await againstCondition(value, condition, opts)) {
    return { value, skipped }
  }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  const valueB = await computeValue(valueA, compute, opts)
  const valueC = await transformValue(valueB, transform, opts)
  return { value: valueC, skipped: false }
}

// Apply `condition(opts)` which skips the current definition if `false` is
// returned.
// If all definitions for a given property are skipped, the property is omitted.
const againstCondition = async function (value, condition, opts) {
  return condition !== undefined && !(await condition(value, opts))
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
/* eslint-enable max-lines */
