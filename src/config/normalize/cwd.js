import isMergeableObject from 'is-mergeable-object'

import { recurseValues } from '../../utils/recurse.js'

import { has } from './lib/prop_path/get.js'

// Since several configuration objects are deeply merged, and each property
// should use the `base` of its configuration file, we need to keep track of
// each configuration property's file, in order to determine which `base` to
// use when the property is a file path.
// We do this by producing a `bases` object for each configuration file, which
// is a mirror of its contents but with all leaf values replaced with the
// file's base.
// Those `bases` objects are deeply merged using the same logic as the
// configuration contents, to ensure they reflect the same merging logic.
// We use `is-mergeable-object` instead of `is-plain-obj` to mimick the
// merging logic.
// We recurse on arrays even though though are not recursively merged, since
// users might use `config#path` references as individual array elements.
export const getBases = function (configContents, base) {
  return recurseValues(
    configContents,
    (value) => getBase(value, base),
    isMergeableObject,
  )
}

const getBase = function (value, base) {
  return Array.isArray(value) || isMergeableObject(value) ? value : base
}

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
export const getPropCwd = function (configInfos, { originalPath }) {
  const configInfo = configInfos.find(({ configContents }) =>
    has(configContents, originalPath),
  )

  if (configInfo !== undefined) {
    return configInfo.base
  }

  const [, topLevelConfigInfo] = configInfos
  return topLevelConfigInfo === undefined
    ? DEFAULT_VALUES_BASE
    : topLevelConfigInfo.base
}

// Base used to resolve file paths in default values when there is no config
// file
const DEFAULT_VALUES_BASE = '.'
// Base used to resolve file paths in CLI flags
export const CLI_FLAGS_BASE = '.'
