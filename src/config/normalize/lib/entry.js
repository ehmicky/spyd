import { applyRule } from './apply.js'
import { getOpts } from './opts.js'

// Apply rule for a specific entry
export const applyEntryRule = async function (
  { config, moves, warnings },
  { input, namePath, rule, rule: { example }, context, cwd, prefix, parent },
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
  return await applyRule({ rule, input, config, moves, warnings, opts })
}
