import { serializePath } from 'wild-wild-parser'

import { callNoInputFunc } from './call.js'
import { applyMoves } from './move.js'
import { computeParent } from './parent.js'

// Retrieve `info` passed to:
//  - Definitions functions
//  - Keyword `main()`
export const getInfo = async function ({
  path,
  inputs,
  context,
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
  return infoB
}

const DEFAULT_PREFIX = 'Option'
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
