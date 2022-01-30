// eslint-disable-next-line no-restricted-imports, node/no-restricted-import
import assert from 'assert'

import isPlainObj from 'is-plain-obj'

// Some configuration properties can have different values per combination
// using "configuration selectors".
// The configuration property uses then an object where:
//  - The key is the selector (same syntax as `select`)
//  - The value is applied for the combinations matching that selector
// This applies configuration definition regardless of whether selectors were
// used or not, and applies them recursively when selectors are used.
// We duplicate `definition` for both `name` and `name.*` so that validation
// error messages on `name` do not show `name.*`
// We do not normalize all properties to the full syntax
//  - For example, using a "default" selector when no selectors are used
//  - Because configuration properties get added later on by some internal logic
//     - It is simpler to specify those without selectors
export const normalizeConfigSelectors = function (definition) {
  const { name, condition } = definition

  if (!SELECTABLE_PROPS.includes(name)) {
    return [definition]
  }

  return [
    {
      name,
      condition: selectorCondition.bind(undefined, {
        condition,
        isSelector: true,
      }),
      validate: validateConfigSelector,
    },
    { ...definition, name: `${name}.*` },
    {
      ...definition,
      condition: selectorCondition.bind(undefined, {
        condition,
        isSelector: false,
      }),
    },
  ]
}

// When selectors are used, validate them
const selectorCondition = function ({ condition, isSelector }, value, opts) {
  return (
    (condition === undefined || condition(value, opts)) &&
    isConfigSelectorShape(value) === isSelector
  )
}

// We distinguish selectors by the usage of a plain object.
// This means selectable properties' value cannot currently be plain objects.
export const isConfigSelectorShape = function (value) {
  return isPlainObj(value)
}

// We validate that at least one selector is named "default"
//  - This ensures users understand that this selector is used as a fallback
// We recommend and document making it the last key
//  - So it follows the object key order and also matches how `switch` works in
//    many programming languages
//  - However, we do not validate its order, since it might be hard in some
//    situations to order, e.g. when merging shared configs.
//  - Regardless, it is always checked last, even if it is not the last key
const validateConfigSelector = function (value) {
  assert(
    Object.keys(value).length !== 0,
    'must have at least one property when using configuration selectors.',
  )
  assert(
    'default' in value,
    'last property must be named "default" when using configuration selectors.',
  )
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
export const SELECTABLE_PROPS = [
  'limit',
  'outliers',
  'precision',
  'showDiff',
  'showPrecision',
  'showTitles',
]
