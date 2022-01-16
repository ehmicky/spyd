import { matchCombination } from '../../select/main.js'
import { mapValues } from '../../utils/map.js'

import { isConfigSelector } from './normalize.js'

// Some configuration properties can have different values per combination
// using "configuration selectors".
// The configuration property uses then an object where:
//  - The key is the selector (same syntax as `select`)
//  - The value is applied for the combinations matching that selector
// Key order:
//  - Selectors are searched in the object keys order.
//  - One key must be "default" and is used as a fallback (even when it is not
//    the last key)
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
  return mapValues(config, (configValue, propName) =>
    applyConfigPropSelectors(combination, configValue, propName),
  )
}

const applyConfigPropSelectors = function (combination, configValue, propName) {
  if (!isConfigSelector(configValue, propName)) {
    return configValue
  }

  const { default: defaultValue, ...configValueA } = configValue
  const matchingSelector = Object.keys(configValueA).find((selector) =>
    matchCombination(combination, [selector], `${propName}.${selector}`),
  )
  return matchingSelector === undefined
    ? defaultValue
    : configValue[matchingSelector]
}
