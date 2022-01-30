import { matchCombination } from '../../select/main.js'
import { normalizeConfigProps } from '../normalize/lib/main.js'

import { SELECTABLE_PROPS } from './normalize.js'

// Selectors are searched in the object keys order.
// One key must be "default" and is used as a fallback (even when it is not the
// last key)
// This method transforms each of those configuration selectors to single values
// based on each given combination.
//  - Each resolved configuration is set to `combinations[*].config`.
export const useResultConfigSelectors = async function (result, config) {
  const combinations = await Promise.all(
    result.combinations.map((combination) =>
      useCombConfigSelectors(combination, config),
    ),
  )
  return { ...result, combinations }
}

const useCombConfigSelectors = async function (combination, config) {
  const configA = await useConfigSelectors(combination, config)
  return { ...combination, config: configA }
}

// Same for a single combination
export const useConfigSelectors = async function (combination, config) {
  return await normalizeConfigProps(config, DEFINITIONS, {
    context: { combination },
  })
}

const getDefinition = function (name) {
  return { name, transform }
}

const transform = function (
  { default: defaultValue, ...values },
  { name, context: { combination } },
) {
  const matchingSelector = Object.keys(values).find((selector) =>
    matchCombination(combination, [selector], `${name}.${selector}`),
  )
  return matchingSelector === undefined
    ? defaultValue
    : values[matchingSelector]
}

const DEFINITIONS = SELECTABLE_PROPS.map(getDefinition)
