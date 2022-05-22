import { resolve } from 'path'

import { validateDefinedString } from '../validate/type.js'

import { callValueFunc } from './call.js'

// Apply `path[(value, opts)]` which resolves the value as an absolute file path
// when `true` (default: `false`).
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
export const resolvePath = async function (value, path, opts) {
  if (!(await callValueFunc(path, value, opts))) {
    return value
  }

  await callValueFunc(validateDefinedString, value, opts)
  return resolve(opts.funcOpts.cwd, value)
}
