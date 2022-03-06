import { applyRule } from './apply.js'
import { addMoves } from './move.js'
import { getOpts } from './opts.js'
import { addWarnings } from './warn.js'
import { set, remove, equals } from './wild_wild_path/main.js'

// Apply rule for a specific entry
export const applyEntryRule = async function (
  { config, moves, warnings },
  {
    value,
    nameQuery,
    namePath,
    rule,
    rule: { example },
    context,
    cwd,
    prefix,
    parent,
  },
) {
  const opts = await getOpts({
    nameQuery,
    namePath,
    config,
    context,
    cwd,
    prefix,
    parent,
    example,
    moves,
  })
  const {
    value: newValue,
    renamedPath = namePath,
    newPaths = [],
    warnings: newWarnings,
  } = await applyRule(rule, value, opts)
  const configA = setConfigValue({ config, namePath, renamedPath, newValue })
  const movesA = addMoves(moves, newPaths, namePath)
  const warningsA = addWarnings(warnings, newWarnings)
  return { config: configA, moves: movesA, warnings: warningsA }
}

const setConfigValue = function ({ config, namePath, renamedPath, newValue }) {
  const configA = equals(namePath, renamedPath)
    ? config
    : remove(config, namePath)
  return newValue === undefined
    ? remove(configA, renamedPath)
    : set(configA, renamedPath, newValue)
}
