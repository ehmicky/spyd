import { serializePath } from 'wild-wild-parser'

import { callNoInputFunc } from './call.js'
import { applyMoves } from './move.js'

// Retrieve `info` passed to:
//  - Definitions functions
//  - Keyword `main()`
// `originalName|Path` are like `name|path` except:
//  - They are prepended with `info.parent`
//  - If a property was moved, they show the previous name
// They are intended for error messages.
// This is in contrast to `name|path` which are the main properties, intended to
// work with everything else, including `info.inputs`.
export const getInfo = async function ({ path, inputs, context, moves }) {
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
  return infoA
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
