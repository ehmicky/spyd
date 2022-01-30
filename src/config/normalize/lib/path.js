import { resolve } from 'path'

import { callValueFunc, callValidateFunc } from './call.js'

// Apply `path(value, opts) => boolean` which resolves the value as an absolute
// file path when `true` (default: `false`).
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
// A `cwd(value, opts)` can be specified to customize the `cwd`.
//  - The default value is `.`, not some `process.cwd()` evaluated at load time,
//    to ensure it is evaluated at runtime.
// An empty value resolves to the `cwd`.
// An empty `cwd` is same as `.`
export const resolvePath = async function (value, { path, cwd, opts }) {
  if (value === undefined || !(await callValueFunc(path, value, opts))) {
    return value
  }

  await callValidateFunc(validatePath, value, opts)
  const cwdA = await callValueFunc(cwd, value, opts)
  return resolve(cwdA, value)
}

const validatePath = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string')
  }
}
