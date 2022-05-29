import { resolve } from 'path'

import { pathExists } from 'path-exists'
import { isDirectory } from 'path-type'

const main = async function (cwd) {
  await validateCwd(cwd)
  const cwdA = resolve(cwd)
  return { info: { cwd: cwdA } }
}

// Errors in `cwd` are not user errors, i.e. should not start with `must`
const validateCwd = async function (cwd) {
  if (typeof cwd !== 'string') {
    throw new TypeError('It must be a string.')
  }

  if (!(await pathExists(cwd))) {
    throw new Error('It must be an existing file.')
  }

  if (!(await isDirectory(cwd))) {
    throw new Error('It must be a directory.')
  }
}

// A `cwd[(info)]` rule can be specified to customize `info.cwd`.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'cwd',
  undefinedInput: true,
  main,
}
