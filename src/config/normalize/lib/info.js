import { serializePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callNoInputFunc } from './call.js'
import { applyMoves } from './move.js'
import { computeParent } from './parent.js'
import { DEFAULT_PREFIX } from './prefix.js'

// Retrieve `info` passed to:
//  - Definitions functions
//  - Keyword `main()`
export const getInfo = async function ({
  path,
  inputs,
  context,
  prefix,
  parent,
  moves,
}) {
  const name = serializePath(path)
  const originalPath = applyMoves(moves, path)
  const originalName = serializePath(originalPath)
  const info = {
    name,
    path,
    originalName,
    originalPath,
    inputs,
    prefix: DEFAULT_PREFIX,
    cwd: DEFAULT_CWD,
  }
  const infoA = await computeContext(context, info)
  const infoB = await computeParent(parent, infoA)
  const infoC = await computePrefix(prefix, infoB)
  return infoC
}

// The default value is `.`, not `process.cwd()`, to ensure it is evaluated
// at runtime, not load time.
const DEFAULT_CWD = '.'

const computeContext = async function (context, info) {
  if (context === undefined) {
    return info
  }

  const contextA = await callNoInputFunc(context, info)
  return contextA === undefined ? info : { ...info, context: contextA }
}

const computePrefix = async function (prefix, info) {
  try {
    return await addPrefix(prefix, info)
  } catch (error) {
    throw wrapError(error, 'Invalid "prefix":')
  }
}

const addPrefix = async function (prefix, info) {
  const prefixA = await callNoInputFunc(prefix, info)

  if (prefixA === undefined) {
    return info
  }

  const prefixB = String(prefixA).trim()
  return { ...info, prefix: prefixB }
}
