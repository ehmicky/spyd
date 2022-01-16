import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { UserError } from '../../error/main.js'

// If a configuration property uses selectors, normalization must be applied
// recursively.
export const normalizeConfigSelectors = function (
  configValue,
  propName,
  normalizer,
) {
  if (!isConfigSelector(configValue, propName)) {
    return normalizer(configValue, propName, propName)
  }

  validateConfigSelector(configValue, propName)

  return mapObj(configValue, (selector, value) => [
    selector,
    normalizer(value, propName, `${propName}.${selector}`),
  ])
}

// Check if a configuration property uses selectors
export const isConfigSelector = function (configValue, propName) {
  return SELECTABLE_PROPS.has(propName) && isPlainObj(configValue)
}

// We validate that at least one selector is named "default"
//  - This ensures users understand that this selector is used as a fallback
// We recommend and document making it the last key
//  - So it follows the object key order and also matches how `switch` works in
//    many programming languages
//  - However, we do not validate its order, since it might be hard in some
//    situations to order, e.g. when merging shared configs.
//  - Regardless, it is always checked last, even if it is not the last key
const validateConfigSelector = function (configValue, propName) {
  if (Object.keys(configValue).length === 0) {
    throw new UserError(
      `'${propName}' must have at least one property when using configuration selectors.`,
    )
  }

  if (configValue.default === undefined) {
    throw new UserError(
      `'${propName}' last property must be named "default" when using configuration selectors.`,
    )
  }
}

// List of properties which can use configuration selectors
// We should avoid any properties which:
//  - Are not combination-specific
//     - Example: `showSystem`
//  - Can use variations
//     - Since `select` can be used instead
//     - This also avoids confusion since they use very similar syntax
//     - Example: `inputs`
//  - Can use the task files' logic to vary
//     - Since `inputs` can be used instead
//  - Can change results
//     - Since it makes combinations' results less comparable
//     - It also removes the need to be persisted
//     - Example: `runnnerConfig`
// At the moment, this also does not work with configuration properties which
// values are objects due to the current implementation.
//  - However, this could be changed if we ever needed it.
const SELECTABLE_PROPS = new Set([
  'limit',
  'outliers',
  'precision',
  'showDiff',
  'showPrecision',
  'showTitles',
])
