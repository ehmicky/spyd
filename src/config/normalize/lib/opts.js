import { getCwd } from './cwd.js'
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
}) {
  const path = parse(name)
  const funcOpts = { name, path, config, context }
  const opts = { funcOpts, example, prefix: DEFAULT_PREFIX }
  const optsA = await computeParents(opts, parents, name)
  const optsB = await computePrefix(optsA, prefix)
  const optsC = await computeCwd(optsB, cwd)
  return optsC
}

const computeParents = async function (opts, parents, name) {
  const nameA = await appendParentsToName(parents, name, opts)
  const pathA = parse(nameA)
  return { ...opts, funcOpts: { ...opts.funcOpts, name: nameA, path: pathA } }
}

const computePrefix = async function (opts, prefix) {
  const prefixA = await getPrefix(prefix, opts)
  return { ...opts, prefix: prefixA }
}

const computeCwd = async function (opts, cwd) {
  const cwdA = await getCwd({ cwd, opts })
  return { ...opts, funcOpts: { ...opts.funcOpts, cwd: cwdA } }
}
