import { callConstraintFunc } from './call.js'
import { performPlugins } from './plugin.js'

// Once the initial input has been computed, apply validation and transforms,
// unless the input is `undefined`.
export const validateAndModify = async function ({
  input,
  required,
  config,
  moves,
  warnings,
  opts,
  ...rule
}) {
  if (input === undefined) {
    await validateRequired(required, opts)
    return { config, warnings, moves }
  }

  const {
    config: configA,
    warnings: warningsA,
    moves: movesA,
  } = await performPlugins({ rule, input, config, moves, warnings, opts })
  return { config: configA, warnings: warningsA, moves: movesA }
}

// Apply `required[(opts)]` which throws if `true` and input is `undefined`
const validateRequired = async function (required, opts) {
  if (await callConstraintFunc(required, opts)) {
    await callConstraintFunc(throwRequired, opts)
  }
}

const throwRequired = function () {
  throw new Error('must be defined.')
}
