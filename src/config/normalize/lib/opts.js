import { callUserFunc } from './call.js'
import { getCwd } from './cwd.js'
import { applyMoves } from './move.js'
import { getPrefix, DEFAULT_PREFIX } from './prefix.js'
import { parsePath, serializePath } from './wild_wild_parser/main.js'

// Retrieve `opts` passed to most methods.
// `funcOpts` are passed to user-provided functions.
export const getOpts = async function ({
  nameQuery,
  namePath,
  config,
  context,
  cwd,
  prefix,
  parent,
  example,
  moves,
}) {
  const originalPath = applyMoves(moves, namePath)
  const originalName = serializePath(originalPath)
  const funcOpts = {
    name: nameQuery,
    path: namePath,
    originalName,
    originalPath,
    config,
    context,
  }
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
  const originalPath = await appendParentToName(parent, opts)
  const originalName = serializePath(originalPath)
  return { ...opts, funcOpts: { ...opts.funcOpts, originalName, originalPath } }
}

// The `parent` option are the names of the parent properties.
// It is exposed as `originalName` and `originalPath`.
// It is a dot-delimited string.
// By default, there are none.
const appendParentToName = async function (parent, opts) {
  const parentA = await callUserFunc(parent, opts)
  const parentPath = parsePath(parentA)
  return [...parentPath, ...opts.funcOpts.originalPath]
}

const computePrefix = async function (opts, prefix) {
  const prefixA = await getPrefix(prefix, opts)
  return { ...opts, prefix: prefixA }
}

const computeCwd = async function (opts, cwd) {
  const cwdA = await getCwd({ cwd, opts })
  return { ...opts, funcOpts: { ...opts.funcOpts, cwd: cwdA } }
}
