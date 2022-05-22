import { callUndefinedValueFunc } from './call.js'
import { performPlugins } from './plugin.js'

// Once the initial value has been computed, apply validation and transforms,
// unless the value is `undefined`.

export const validateAndModify = async function ({
  value,
  required,
  config,
  moves,
  warnings,
  opts,
  ...rule
}) {
  if (value === undefined) {
    await validateRequired(required, opts)
    return { value }
  }

  const {
    config: configA,
    warnings: warningsA,
    moves: movesA,
  } = await performPlugins({
    rule,
    value,
    config,
    moves,
    warnings,
    opts,
  })
  return { config: configA, warnings: warningsA, moves: movesA }
}

// Apply `required[(opts)]` which throws if `true` and value is `undefined`
const validateRequired = async function (required, opts) {
  if (await callUndefinedValueFunc(required, opts)) {
    await callUndefinedValueFunc(throwRequired, opts)
  }
}

const throwRequired = function () {
  throw new Error('must be defined.')
}
