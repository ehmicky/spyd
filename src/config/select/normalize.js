import isPlainObj from 'is-plain-obj'

import { parseSelectors } from '../../select/parse.js'

// If a configuration property uses selectors, normalization must be applied
// recursively.
// We also parse the selectors as early as possible, for performance and to
// validate them.
export const normalizeConfigSelectors = function (
  configValue,
  propName,
  normalizer,
) {
  if (!isConfigSelector(configValue, propName)) {
    return normalizer(configValue, propName, propName)
  }

  return Object.entries(configValue).map(([selector, value]) =>
    parseSelector({ selector, value, propName, normalizer }),
  )
}

const isConfigSelector = function (configValue, propName) {
  return SELECTABLE_PROPS.has(propName) && isPlainObj(configValue)
}

// List of properties which can use configuration selectors
export const SELECTABLE_PROPS = new Set(['limit', 'outliers', 'precision'])

const parseSelector = function ({ selector, value, propName, normalizer }) {
  const name = `${propName}.${selector}`
  const selectors = parseSelectors([selector], name)
  const valueA = normalizer(value, propName, name)
  return { selectors, value: valueA }
}
