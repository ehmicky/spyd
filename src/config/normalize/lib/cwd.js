import { resolve } from 'path'

import { pathExists } from 'path-exists'
import { isDirectory } from 'path-type'

import { wrapError } from '../../../error/wrap.js'

import { callNoInputFunc } from './call.js'
import { validateDefinedString } from './type.js'

// The default value is `.`, not `process.cwd()`, to ensure it is evaluated
// at runtime, not load time.
export const DEFAULT_CWD = '.'

// A `cwd[(opts)]` option can be specified to customize the `cwd`.
export const computeCwd = async function (cwd, opts) {
  if (cwd === undefined) {
    return opts
  }

  const cwdA = await callCwdFunc(cwd, opts)
  await callNoInputFunc(checkCwd.bind(undefined, cwdA), opts)
  const cwdB = resolve(cwdA)
  return { ...opts, cwd: cwdB }
}

const callCwdFunc = async function (cwd, opts) {
  try {
    return await callNoInputFunc(cwd, opts)
  } catch (error) {
    throw wrapError(error, 'Invalid "cwd" function:')
  }
}

const checkCwd = async function (cwd) {
  try {
    validateDefinedString(cwd)
    await validateFileExists(cwd)
    await validateDirectory(cwd)
  } catch (error) {
    // Errors in `cwd` are not user errors, i.e. should not start with `must`
    throw wrapError(error, `Invalid "cwd" value "${cwd}":\n"cwd"`)
  }
}

const validateFileExists = async function (cwd) {
  if (!(await pathExists(cwd))) {
    throw new Error('must be an existing file.')
  }
}

const validateDirectory = async function (cwd) {
  if (!(await isDirectory(cwd))) {
    throw new Error('must be a directory.')
  }
}
