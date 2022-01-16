import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { matchSelectors } from '../../select/match.js'

import { SELECTABLE_PROPS } from './normalize.js'

// Transform a configuration property using multiple selectors to a single
// value, based on which selector matches a given combination.
// We iterate by object key order.
//  - If no selector matches, we use the last one as a fallback
export const applyConfigSelectors = function (combination, config) {
  return mapObj(config, (name, configValue) => [
    name,
    applyConfigPropSelectors(combination, configValue),
  ])
}

const applyConfigPropSelectors = function (combination, configValue) {
  if (!isParsedConfigSelector(configValue)) {
    return configValue
  }

  const { value } = configValue.find(({ selectors }, index, values) =>
    matchConfigSelector({ combination, selectors, index, values }),
  )
  return value
}

// Make the logic a noop if the configuration property does not use selectors
const isParsedConfigSelector = function (name, configValue) {
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
