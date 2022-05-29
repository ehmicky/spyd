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
  path,
  inputs,
  context,
  cwd,
  prefix,
  parent,
  rule: { example },
  moves,
}) {
  const name = serializePath(path)
  const originalPath = applyMoves(moves, path)
  const originalName = serializePath(originalPath)
  const opts = {
    name,
    path,
    originalName,
    originalPath,
    inputs,
    prefix: DEFAULT_PREFIX,
    cwd: DEFAULT_CWD,
  }
  const optsA = await computeContext(context, opts)
  const optsB = await computeParent(parent, optsA)
  const optsC = await computePrefix(prefix, optsB)
  const optsD = await computeExample(example, optsC)
  const optsE = await computeCwd(cwd, optsD)
  return optsE
}

const computeContext = async function (context, opts) {
  if (context === undefined) {
    return opts
  }

  const contextA = await callNoInputFunc(context, opts)
  return contextA === undefined ? opts : { ...opts, context: contextA }
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

// Add an example input value as error suffix, as provided by `example[(opts)]`
const computeExample = async function (example, opts) {
  if (example === undefined) {
    return opts
  }

  const exampleA = await callNoInputFunc(example, opts)
  return exampleA === undefined ? opts : { ...opts, example: exampleA }
}
