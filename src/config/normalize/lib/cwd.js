import { resolve } from 'path'

import { wrapError } from '../../../error/wrap.js'
import { validateFileExists, validateDirectory } from '../validate/fs.js'

import { callNoValueFunc } from './call.js'
import { validateDefinedString } from './type.js'

// A `cwd[(opts)]` option can be specified to customize the `cwd`.
//  - The default value is `.`, not `process.cwd()`, to ensure it is evaluated
//    at runtime, not load time.
export const computeCwd = async function (cwd, opts) {
  const cwdA = await getCwd({ cwd, opts })
  return { ...opts, funcOpts: { ...opts.funcOpts, cwd: cwdA } }
}

const getCwd = async function ({ cwd = DEFAULT_CWD, opts }) {
  const cwdA = await callCwdFunc(cwd, opts)
  await callNoValueFunc(checkCwd.bind(undefined, cwdA), opts)
  return resolve(cwdA)
}

const DEFAULT_CWD = '.'

const callCwdFunc = async function (func, opts) {
  try {
    return await callNoValueFunc(func, opts)
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
