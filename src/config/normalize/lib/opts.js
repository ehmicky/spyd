import { getCwd } from './cwd.js'
import { applyMoves } from './move.js'
import { appendParentsToName } from './parents.js'
import { getPrefix, DEFAULT_PREFIX } from './prefix.js'
import { parse } from './prop_path/parse.js'

// Retrieve `opts` passed to most methods.
// `funcOpts` are passed to user-provided functions.
export const getOpts = async function ({
  name,
  config,
  context,
  cwd,
  prefix,
  parents,
  example,
  moves,
}) {
  const path = parse(name)
  const funcOpts = { name, path, config, context }
  const opts = { funcOpts, example, prefix: DEFAULT_PREFIX }
  const optsA = await computeOriginalName(opts, moves, parents)
  const optsB = await computePrefix(optsA, prefix)
  const optsC = await computeCwd(optsB, cwd)
  return optsC
}

const computeOriginalName = async function (opts, moves, parents) {
  const originalName = applyMoves(moves, opts.funcOpts.name)
  const originalNameA = await appendParentsToName(parents, originalName, opts)
  const originalPath = parse(originalNameA)
  return {
    ...opts,
    funcOpts: { ...opts.funcOpts, originalName: originalNameA, originalPath },
  }
}

const computePrefix = async function (opts, prefix) {
  const prefixA = await getPrefix(prefix, opts)
  return { ...opts, prefix: prefixA }
}

const computeCwd = async function (opts, cwd) {
  const cwdA = await getCwd({ cwd, opts })
  return { ...opts, funcOpts: { ...opts.funcOpts, cwd: cwdA } }
}
