import { callUserFunc } from './call.js'
import { getCwd } from './cwd.js'
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
  const opts = { funcOpts, example }
  const parentsA = await callUserFunc(parents, opts)
  const optsA = { ...opts, parents: parentsA }
  const prefixA = await callUserFunc(prefix, opts)
  const optsB = { ...optsA, prefix: prefixA }
  const cwdA = await getCwd({ cwd, opts: optsB })
  return { ...optsB, funcOpts: { ...funcOpts, cwd: cwdA } }
}
