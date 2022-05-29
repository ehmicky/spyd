import { serializePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callNoInputFunc } from './call.js'
import { computeCwd, DEFAULT_CWD } from './cwd.js'
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
  cwd,
  prefix,
  parent,
  rule: { example },
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
  const infoD = await computeExample(example, infoC)
  const infoE = await computeCwd(cwd, infoD)
  return infoE
}

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

// Add an example input value as error suffix, as provided by `example[(info)]`
const computeExample = async function (example, info) {
  if (example === undefined) {
    return info
  }

  const exampleA = await callNoInputFunc(example, info)
  return exampleA === undefined ? info : { ...info, example: exampleA }
}
