import { resolve } from 'path'

import { wrapError } from '../../../error/wrap.js'
import { validateFileExists, validateDirectory } from '../validate/fs.js'
import { validateDefinedString } from '../validate/simple.js'

import { callValueFunc, callUserFunc } from './call.js'

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
    validateDefinedString(value)
    await validateFileExists(value)
    await validateDirectory(value)
  } catch (error) {
    // Errors in `cwd` are not user errors, i.e. should not start with `must`
    throw wrapError(error, 'current directory')
  }
}
