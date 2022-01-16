import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

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

  return mapObj(configValue, (selector, value) => [
    selector,
    normalizer(value, propName, `${propName}.${selector}`),
  ])
}

// Check if a configuration property uses selectors
export const isConfigSelector = function (configValue, propName) {
  return SELECTABLE_PROPS.has(propName) && isPlainObj(configValue)
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
const SELECTABLE_PROPS = new Set([
  'limit',
  'outliers',
  'precision',
  'showDiff',
  'showPrecision',
  'showTitles',
])
