import mapObj from 'map-obj'

import { matchCombination } from '../../select/main.js'

import { isConfigSelector } from './normalize.js'

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
  return mapObj(config, (propName, configValue) => [
    propName,
    applyConfigPropSelectors(combination, configValue, propName),
  ])
}

const applyConfigPropSelectors = function (combination, configValue, propName) {
  if (!isConfigSelector(configValue, propName)) {
    return configValue
  }

  const [, value] = Object.entries(configValue).find(
    ([selector], index, values) =>
      matchConfigSelectors({ combination, selector, index, values, propName }),
  )
  return value
}

const matchConfigSelectors = function ({
  combination,
  selector,
  index,
  values,
  propName,
}) {
  return (
    index === values.length - 1 ||
    matchCombination(combination, [selector], `${propName}.${selector}`)
  )
}
