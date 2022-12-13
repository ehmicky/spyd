import { matchCombination } from '../../select/main.js'
import { normalizeConfig } from '../normalize/main.js'

import { SELECTABLE_PROPS, isConfigSelectorShape } from './normalize.js'

// Selectors are searched in the object keys order.
// One key must be "default" and is used as a fallback (even when it is not the
// last key)
// This method transforms each of those configuration selectors to single values
// based on each given combination.
//  - Each resolved configuration is set to `combinations[*].config`.
export const useResultConfigSelectors = async (result, config) => {
  const combinations = await Promise.all(
    result.combinations.map((combination) =>
      useCombConfigSelectors(combination, config),
    ),
  )
  return { ...result, combinations }
}

const useCombConfigSelectors = async (combination, config) => {
  const configA = await useConfigSelectors(combination, config)
  return { ...combination, config: configA }
}

// Same for a single combination
export const useConfigSelectors = async (combination, config) =>
  await normalizeConfig(config, RULES, {
    all: { context: { combination } },
  })

// Some values might not be using selectors. Those do not need to be transformed
const getRule = (name) => ({
  name,
  condition: isConfigSelectorShape,
  transform,
})

const transform = (
  { default: defaultValue, ...values },
  { name, context: { combination } },
) => {
  const matchingSelector = Object.keys(values).find((selector) =>
    matchCombination(combination, [selector], `${name}.${selector}`),
  )
  return matchingSelector === undefined
    ? defaultValue
    : values[matchingSelector]
}

const RULES = SELECTABLE_PROPS.map(getRule)
