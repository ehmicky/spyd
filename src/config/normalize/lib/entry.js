import { isSamePath } from 'wild-wild-parser'
import { set, remove } from 'wild-wild-path'

import { applyRule } from './apply.js'
import { addMoves } from './move.js'
import { getOpts } from './opts.js'
import { addWarning } from './warn.js'

// Apply rule for a specific entry
export const applyEntryRule = async function (
  { config, moves, warnings },
  { value, namePath, rule, rule: { example }, context, cwd, prefix, parent },
) {
  const opts = await getOpts({
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
    warning,
  } = await applyRule(rule, value, opts)
  const configA = setConfigValue({ config, namePath, renamedPath, newValue })
  const movesA = addMoves(moves, newPaths, namePath)
  const warningsA = addWarning(warnings, warning)
  return { config: configA, moves: movesA, warnings: warningsA }
}

const setConfigValue = function ({ config, namePath, renamedPath, newValue }) {
  const configA = isSamePath(namePath, renamedPath)
    ? config
    : remove(config, namePath)
  return newValue === undefined
    ? remove(configA, renamedPath)
    : set(configA, renamedPath, newValue)
}
