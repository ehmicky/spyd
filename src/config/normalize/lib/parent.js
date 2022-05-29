import { normalizePath, serializePath } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { callNoInputFunc } from './call.js'

// `originalName|Path` are like `name|path` except:
//  - They are prepended with `info.parent`
//  - If a property was moved, they show the previous name
// They are intended for error messages.
// This is in contrast to `name|path` which are the main properties, intended to
// work with everything else, including `info.inputs`.
export const computeParent = async function (parent, info) {
  if (parent === undefined) {
    return info
  }

  try {
    return await getParent(parent, info)
  } catch (error) {
    throw wrapError(error, 'Invalid "parent":')
  }
}

const getParent = async function (parent, info) {
  const originalPath = await appendParentToName(parent, info)
  const originalName = serializePath(originalPath)
  return { ...info, originalName, originalPath }
}

// The `parent` option are the names of the parent properties.
// It is exposed as `originalName` and `originalPath`.
// It is a dot-delimited string.
// By default, there are none.
// `normalizePath()` might throw if `parent` contains syntax errors.
const appendParentToName = async function (parent, info) {
  const parentA = await callNoInputFunc(parent, info)
  const parentPath = normalizePath(parentA)
  return [...parentPath, ...info.originalPath]
}
