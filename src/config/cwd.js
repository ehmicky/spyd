import filterObj from 'filter-obj'

import { recurseValues } from '../utils/recurse.js'

import { isRecurseObject } from './merge.js'
import { get } from './normalize/lib/star_dot_path/main.js'

// When resolving configuration relative file paths:
//   - The CLI and programmatic flags always use the current directory.
//      - Except the `config` flag which looks also in some specific
//        directories
//   - The files in `spyd.*` use the configuration file's directory instead.
//      - This is what most users would expect.
//   - Default values use `spyd.*` if there is one, or the current directory
//     otherwise
// In contrast, the `cwd` flag:
//   - is not used for configuration file paths since it might be confusing:
//      - `cwd` flag would be relative to the current directory while other
//        flags would be relative to the `cwd` flag
//      - While the `cwd` flag would impact other flags, `cwd` in `spyd.*`
//        would not
//   - is used for:
//      - file searches: `.git` directory
//      - child process execution: runner process
//   - defaults to the current directory
//   - reasons:
//      - This is what most users would expect
//      - This allows users to change cwd to modify the behavior of those file
//        searches and processes
//         - For example, a task using a file or using the current git
//           repository could be re-used for different cwd
//   - user can opt-out of that behavior by using absolute file paths, for
//     example using the current file's path (e.g. `import.meta.url`)
// We purposely use `originalPath` instead of `path` to ensure this works even
// if the property is normalized.
export const getDefaultBase = function ([defaultBase = DEFAULT_VALUES_BASE]) {
  return defaultBase
}

// Base used to resolve file paths in default values when there is no config
// file
const DEFAULT_VALUES_BASE = '.'
// Base used to resolve file paths in CLI flags
export const CLI_FLAGS_BASE = '.'

// Since several configuration objects are deeply merged, and each property
// should use the `base` of its configuration file, we need to keep track of
// each configuration property's file, in order to determine which `base` to
// use when the property is a file path.
// We do this by creating a sibling next to each property with this information.
// This ensures those properties work with deep merging:
//  - As properties are deep merged, they base property will too, using the same
//    merging logic
// Array properties:
//  - Are recursed even though those are not recursively merged, since users
//    might use `config#path` references as individual array elements.
//  - Items bases are kept in a separate base property on the parent object,
//    since using sibling properties on an array is not possible.
export const addBases = function (configContents, base) {
  return recurseBaseProps(configContents, (value) => addBaseProps(value, base))
}

const addBaseProps = function (value, base) {
  return Object.fromEntries(
    Object.entries(value).flatMap(addBaseProp.bind(undefined, base)),
  )
}

const addBaseProp = function (base, [key, value]) {
  const currentEntry = [key, value]
  const baseEntry = [`${key}${BASE_KEY_SUFFIX}`, base]
  return Array.isArray(value)
    ? [
        currentEntry,
        baseEntry,
        [`${key}${BASE_ITEMS_SUFFIX}`, value.map(() => base)],
      ]
    : [currentEntry, baseEntry]
}

// Remove the base properties after they've been used
export const removeBases = function (configWithBases) {
  return recurseBaseProps(configWithBases, removeBaseProps)
}

const removeBaseProps = function (value) {
  return filterObj(value, isNotBaseProp)
}

const isNotBaseProp = function (key) {
  return !key.endsWith(BASE_KEY_SUFFIX) && !key.endsWith(BASE_ITEMS_SUFFIX)
}

const recurseBaseProps = function (configObject, mapper) {
  return recurseValues(
    configObject,
    (value) => mapBaseProps(value, mapper),
    isRecurseObject,
  )
}

const mapBaseProps = function (value, mapper) {
  return isRecurseObject(value) ? mapper(value) : value
}

const BASE_KEY_SUFFIX = 'CwdBase'
const BASE_ITEMS_SUFFIX = 'ItemsCwdBase'

// Used as `cwd` for all configuration properties
export const getPropCwd = function (
  { configWithBases, defaultBase },
  { originalPath },
) {
  if (originalPath.length === 0) {
    return defaultBase
  }

  const basePath = getBasePath(originalPath)
  const base = get(configWithBases, basePath)
  return typeof base === 'string' ? base : defaultBase
}

// Retrieve the path to the `*[Items]CwdBase` property
export const getBasePath = function (originalPath) {
  const lastKey = originalPath[originalPath.length - 1]

  if (!Number.isInteger(lastKey)) {
    return [...originalPath.slice(0, -1), `${lastKey}${BASE_KEY_SUFFIX}`]
  }

  const secondLastKey = originalPath[originalPath.length - 2]
  return [
    ...originalPath.slice(0, -2),
    `${secondLastKey}${BASE_ITEMS_SUFFIX}`,
    lastKey,
  ]
}
