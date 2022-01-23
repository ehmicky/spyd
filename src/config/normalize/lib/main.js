import pProps from 'p-props'

import { cleanObject } from '../../../utils/clean.js'
import { mapValues } from '../../../utils/map.js'

import { runDagAsync } from './dag/run.js'
import { applyDefinitionList } from './definitions.js'
import { retrieveGet } from './get.js'
import { isParent } from './prop_path/compare.js'
import { list } from './prop_path/get.js'
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
//  - This is used instead of allowing properties to set each others, which
//    would be more complicated and lead to ambiguous order
// TODO: abstract this function to its own library
export const normalizeConfigProps = async function (
  config,
  definitions,
  { context },
) {
  const queries = Object.keys(definitions)
  const definitionsFuncs = mapValues(definitions, (definitionList, query) =>
    normalizePropDeep.bind(undefined, {
      queries,
      definitionList,
      query,
      config,
      context,
    }),
  )
  const allConfigValues = await runDagAsync(definitionsFuncs)
  const configA = mergeConfigProps(allConfigValues)
  const configB = cleanObject(configA)
  return configB
}

const normalizePropDeep = async function (
  { queries, definitionList, query, config, context },
  getProp,
) {
  const configA = await setParentProps({ config, queries, query, getProp })
  const get = retrieveGet(getProp)
  const props = list(configA, query)
  return await pProps(props, (value, name) =>
    applyDefinitionList({ value, name, definitionList, context, get }),
  )
}

// Children properties await their parent, and use their parent normalized
// values
const setParentProps = async function ({ config, queries, query, getProp }) {
  const parentQueries = queries.filter((queryB) => isParent(query, queryB))
  const configValues = await Promise.all(parentQueries.map(getProp))
  return setConfigValues(configValues, config)
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
