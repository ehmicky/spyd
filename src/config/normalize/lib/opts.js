import { serializePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callNoInputFunc } from './call.js'
import { computeCwd, DEFAULT_CWD } from './cwd.js'
import { applyMoves } from './move.js'
import { computeParent } from './parent.js'
import { DEFAULT_PREFIX } from './prefix.js'

// Retrieve `opts` passed to:
//  - Definitions functions
//  - Keyword `main()`
export const getOpts = async function ({
  namePath,
  config,
  context,
  cwd,
  prefix,
  parent,
  rule: { example },
  moves,
}) {
  const name = serializePath(namePath)
  const originalPath = applyMoves(moves, namePath)
  const originalName = serializePath(originalPath)
  const opts = {
    name,
    path: namePath,
    originalName,
    originalPath,
    config,
    context,
    example,
    prefix: DEFAULT_PREFIX,
    cwd: DEFAULT_CWD,
  }
  const optsA = await computeParent(parent, opts)
  const optsB = await computePrefix(prefix, optsA)
  const optsC = await computeCwd(cwd, optsB)
  return optsC
}

const computePrefix = async function (prefix, opts) {
  try {
    return await addPrefix(prefix, opts)
  } catch (error) {
    throw wrapError(error, 'Invalid "prefix":')
  }
}

const addPrefix = async function (prefix, opts) {
  const prefixA = await callNoInputFunc(prefix, opts)

  if (prefixA === undefined) {
    return opts
  }

  const prefixB = String(prefixA).trim()
  return { ...opts, prefix: prefixB }
}
