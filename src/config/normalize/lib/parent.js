import { normalizePath, serializePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callNoInputFunc } from './call.js'

// `originalName|Path` are like `name|path` except:
//  - They are prepended with `opts.parent`
//  - If a property was moved, they show the previous name
// They are intended for error messages.
// This is in contrast to `name|path` which are the main properties, intended to
// work with everything else, including `rule.name`, `rule.rename` and
// `opts.config`.
export const computeParent = async function (parent, opts) {
  if (parent === undefined) {
    return opts
  }

  try {
    return await getParent(parent, opts)
  } catch (error) {
    throw wrapError(error, 'Invalid "parent":')
  }
}

const getParent = async function (parent, opts) {
  const originalPath = await appendParentToName(parent, opts)
  const originalName = serializePath(originalPath)
  return { ...opts, originalName, originalPath }
}

// The `parent` option are the names of the parent properties.
// It is exposed as `originalName` and `originalPath`.
// It is a dot-delimited string.
// By default, there are none.
// `normalizePath()` might throw if `parent` contains syntax errors.
const appendParentToName = async function (parent, opts) {
  const parentA = await callNoInputFunc(parent, opts)
  const parentPath = normalizePath(parentA)
  return [...parentPath, ...opts.originalPath]
}
