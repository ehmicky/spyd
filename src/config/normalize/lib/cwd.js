import { resolve } from 'path'

import { pathExists } from 'path-exists'
import { isDirectory } from 'path-type'

import { wrapError } from '../../../error/wrap.js'

import { callValueFunc, callUserFunc } from './call.js'
import { checkPath } from './path.js'

// A `cwd[(opts)]` option can be specified to customize the `cwd`.
//  - The default value is `.`, not `process.cwd()`, to ensure it is evaluated
//    at runtime, not load time.
export const getCwd = async function ({ cwd = DEFAULT_CWD, opts }) {
  const cwdA = await callUserFunc(cwd, opts)
  await callValueFunc(checkCwd, cwdA, opts)
  return resolve(cwdA)
}

const DEFAULT_CWD = '.'

const checkCwd = async function (value) {
  try {
    await checkDir(value)
  } catch (error) {
    // Errors in `cwd` are not user errors, i.e. should not start with `must`
    throw wrapError(error, "'s current directory")
  }
}

const checkDir = async function (value) {
  checkPath(value)

  if (!(await pathExists(value))) {
    throw new Error('must be an existing file.')
  }

  if (!(await isDirectory(value))) {
    throw new Error('must be a directory.')
  }
}
