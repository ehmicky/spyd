import { getCwd } from './cwd.js'
import { applyMoves } from './move.js'
import { appendParentToName } from './parent.js'
import { getPrefix, DEFAULT_PREFIX } from './prefix.js'
import { parse } from './star_dot_path/main.js'

// Retrieve `opts` passed to most methods.
// `funcOpts` are passed to user-provided functions.
export const getOpts = async function ({
  name,
  config,
  context,
  cwd,
  prefix,
  parent,
  example,
  moves,
}) {
  const path = parse(name)
  const originalName = applyMoves(moves, name)
  const originalPath = parse(originalName)
  const funcOpts = { name, path, originalName, originalPath, config, context }
  const opts = { funcOpts, example, prefix: DEFAULT_PREFIX }
  const optsA = await computeParent(opts, moves, parent)
  const optsB = await computePrefix(optsA, prefix)
  const optsC = await computeCwd(optsB, cwd)
  return optsC
}

// `originalName|Path` are like `name|path` except:
//  - They are prepended with `opts.parent`
//  - If a property was moved, they show the previous name
// They are intended for error messages.
// This is in contrast to `name|path` which are the main properties, intended to
// work with everything else, including `rule.name`, `rule.rename` and
// `funcOpts.config`.
const computeParent = async function (opts, moves, parent) {
  const originalName = await appendParentToName({ parent, opts })
  const originalPath = parse(originalName)
  return { ...opts, funcOpts: { ...opts.funcOpts, originalName, originalPath } }
}

const computePrefix = async function (opts, prefix) {
  const prefixA = await getPrefix(prefix, opts)
  return { ...opts, prefix: prefixA }
}

const computeCwd = async function (opts, cwd) {
  const cwdA = await getCwd({ cwd, opts })
  return { ...opts, funcOpts: { ...opts.funcOpts, cwd: cwdA } }
}
