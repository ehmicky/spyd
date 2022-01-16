import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { matchSelectors } from '../../select/match.js'

import { SELECTABLE_PROPS } from './normalize.js'

// Some configuration properties can have different values per combination
// using "configuration selectors".
// The configuration property uses then an object where:
//  - The key is the selector (same syntax as `select`)
//  - The value is applied for the combinations matching that selector
// Key order:
//  - Selectors are searched in the object keys order.
//  - The last key must be "default" and is used as a fallback.
// This method transforms each of those configuration selectors to single values
// based on each given combination.
//  - Each resolved configuration is set to `combinations[*].config`.
export const useResultConfigSelectors = function (result, config) {
  const combinations = result.combinations.map((combination) =>
    useCombConfigSelectors(combination, config),
  )
  return { ...result, combinations }
}

const useCombConfigSelectors = function (combination, config) {
  const configA = useConfigSelectors(combination, config)
  return { ...combination, config: configA }
}

// Same for a single combination
export const useConfigSelectors = function (combination, config) {
  return mapObj(config, (name, configValue) => [
    name,
    applyConfigPropSelectors(combination, configValue, name),
  ])
}

const applyConfigPropSelectors = function (combination, configValue, name) {
  if (!isParsedConfigSelectors(configValue, name)) {
    return configValue
  }

  const { value } = configValue.find(({ selectors }, index, values) =>
    matchConfigSelectors({ combination, selectors, index, values }),
  )
  return value
}

// The logic is a noop if the configuration property does not use selectors
const isParsedConfigSelectors = function (configValue, name) {
  return (
    SELECTABLE_PROPS.has(name) &&
    Array.isArray(configValue) &&
    configValue.every(isPlainObj)
  )
}

const matchConfigSelectors = function ({
  combination,
  selectors,
  index,
  values,
}) {
  return index === values.length - 1 || matchSelectors(combination, selectors)
}
