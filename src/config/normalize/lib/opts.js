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
  example,
}) {
  const path = parse(name)
  const funcOpts = { name, path, config, context }
  const opts = { funcOpts, prefix, example }
  const cwdA = await getCwd({ cwd, opts })
  return { ...opts, funcOpts: { ...funcOpts, cwd: cwdA } }
}
