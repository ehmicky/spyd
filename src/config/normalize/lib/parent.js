import { normalizePath, serializePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callNoValueFunc } from './call.js'

// `originalName|Path` are like `name|path` except:
//  - They are prepended with `opts.parent`
//  - If a property was moved, they show the previous name
// They are intended for error messages.
// This is in contrast to `name|path` which are the main properties, intended to
// work with everything else, including `rule.name`, `rule.rename` and
// `funcOpts.config`.
export const computeParent = async function (parent, opts) {
  try {
    return await getParent(parent, opts)
  } catch (error) {
    throw wrapError(error, 'Invalid "parent":')
  }
}

const getParent = async function (parent, opts) {
  const originalPath = await appendParentToName(parent, opts)
  const originalName = serializePath(originalPath)
  return {
    ...opts,
    funcOpts: { ...opts.funcOpts, originalName, originalPath },
  }
}

// The `parent` option are the names of the parent properties.
// It is exposed as `originalName` and `originalPath`.
// It is a dot-delimited string.
// By default, there are none.
const appendParentToName = async function (parent, opts) {
  const parentA = await callNoValueFunc(parent, opts)
  const parentPath = normalizePath(parentA)
  return [...parentPath, ...opts.funcOpts.originalPath]
}