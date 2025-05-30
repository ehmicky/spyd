import { get } from 'wild-wild-path'
import { exclude, map } from 'wild-wild-utils'

import { mapValues } from '../utils/map.js'

import { isArrayUpdatesObject, isMergeProp, isRecurseObject } from './merge.js'

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
export const getDefaultBase = ([defaultBase = DEFAULT_VALUES_BASE]) =>
  defaultBase

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
//  - Are recursed too since those might be recursively merged
//  - Items bases are kept in a separate base property on the parent object,
//    since using sibling properties on an array is not possible.
// The logic works with `_merge` and array updates objects.
export const addBases = (configContents, base) =>
  map(configContents, '**', (value) => addBaseProps(value, base))

const addBaseProps = (value, base) =>
  isRecurseObject(value) && !isArrayUpdatesObject(value)
    ? Object.fromEntries(
        Object.entries(value).flatMap(addBaseProp.bind(undefined, base)),
      )
    : value

const addBaseProp = (base, [key, value]) => {
  const currentEntry = [key, value]
  const baseEntry = [`${key}${BASE_KEY_SUFFIX}`, base]

  if (isMergeProp(key)) {
    return [currentEntry]
  }

  if (isArrayUpdatesObject(value)) {
    return [
      currentEntry,
      baseEntry,
      [`${key}${BASE_ITEMS_SUFFIX}`, addUpdatesBases(value, base)],
    ]
  }

  if (Array.isArray(value)) {
    return [
      currentEntry,
      baseEntry,
      [`${key}${BASE_ITEMS_SUFFIX}`, value.map(() => base)],
    ]
  }

  return [currentEntry, baseEntry]
}

const addUpdatesBases = (updatesObject, base) =>
  mapValues(updatesObject, (value) => addUpdatesBase(value, base))

const addUpdatesBase = (value, base) =>
  Array.isArray(value) ? value.map(() => base) : base

// Remove the base properties after they've been used
export const removeBases = (configWithBases) =>
  exclude(configWithBases, '**', isBaseProp, { entries: true })

const isBaseProp = ({ path }) => {
  const key = path.at(-1)
  return (
    typeof key === 'string' &&
    (key.endsWith(BASE_KEY_SUFFIX) || key.endsWith(BASE_ITEMS_SUFFIX))
  )
}

// Used as `cwd` for all configuration properties
export const getPropCwd = (
  { configWithBases, defaultBase },
  { originalPath },
) => {
  if (originalPath.length === 0) {
    return defaultBase
  }

  const basePath = getBasePath(originalPath)
  const base = get(configWithBases, basePath)
  return typeof base === 'string' ? base : defaultBase
}

// Retrieve the path to the `*[Items]CwdBase` property
const getBasePath = (originalPath) => {
  const lastKey = originalPath.at(-1)

  if (!Number.isInteger(lastKey)) {
    return [...originalPath.slice(0, -1), `${lastKey}${BASE_KEY_SUFFIX}`]
  }

  const secondLastKey = originalPath.at(-2)
  return [
    ...originalPath.slice(0, -2),
    `${secondLastKey}${BASE_ITEMS_SUFFIX}`,
    lastKey,
  ]
}

const BASE_KEY_SUFFIX = 'CwdBase'
const BASE_ITEMS_SUFFIX = 'ItemsCwdBase'
