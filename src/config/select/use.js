import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { matchSelectors } from '../../select/match.js'

import { SELECTABLE_PROPS } from './normalize.js'

// Transform each configuration property using multiple selectors to a single
// value, based on which selector matches a given combination.
// Add each resolved configuration to `combinations[*].config`.
// We iterate by object key order.
//  - If no selector matches, we use the last one as a fallback
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

// Same for a single configuration property
export const useConfigSelectors = function (combination, config) {
  return mapObj(config, (name, configValue) => [
    name,
    applyConfigPropSelectors(combination, configValue, name),
  ])
}

const applyConfigPropSelectors = function (combination, configValue, name) {
  if (!isParsedConfigSelector(configValue, name)) {
    return configValue
  }

  const { value } = configValue.find(({ selectors }, index, values) =>
    matchConfigSelector({ combination, selectors, index, values }),
  )
  return value
}

// Make the logic a noop if the configuration property does not use selectors
const isParsedConfigSelector = function (configValue, name) {
  return (
    SELECTABLE_PROPS.has(name) &&
    Array.isArray(configValue) &&
    configValue.every(isPlainObj)
  )
}

const matchConfigSelector = function ({
  combination,
  selectors,
  index,
  values,
}) {
  return index === values.length - 1 || matchSelectors(combination, selectors)
}
