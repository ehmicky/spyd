import { resolve } from 'path'

import mapObj from 'map-obj'

// Resolve configuration relative file paths to absolute paths
// When resolving configuration relative file paths:
//   - The CLI and programmatic flags always use the current directory.
//      - The `cwd` configuration property is not used since it might be
//        confusing:
//         - `cwd` flag would be relative to the current directory while other
//           flags would be relative to the `cwd` flag
//         - while the `cwd` flag would impact other flags, `cwd` in `spyd.*`
//           would not
//   - The files in `spyd.*` use the configuration file's directory instead.
//      - We do this since this is what most users would expect.
// In contrast, the `cwd` flag:
//   - is used for:
//      - file searches:
//         - `config` flag default value
//         - `tasks` flag default value
//         - `.git` directory
//      - child process execution:
//         - runner process
//   - defaults to the current directory
//   - reasons:
//      - This is what most users would expect
//      - This allows users to change cwd to modify the behavior of those file
//        searches and processes
//         - For example, a task using a file or using the current git
//           repository could be re-used for different cwd
//   - user can opt-out of that behavior by using absolute file paths, for
//     example using the current file's path (e.g. `__filename|__dirname`)
export const resolveConfigPaths = function (config, cwd) {
  return mapObj(config, (propName, value) => [
    propName,
    resolveConfigProp(propName, value, cwd),
  ])
}

// Resolve all file path configuration properties.
// Done recursively since some are objects.
const resolveConfigProp = function (propName, value, cwd) {
  if (!PATH_CONFIG_PROPS.has(propName) || value === undefined || value === '') {
    return value
  }

  return resolve(cwd, value)
}

// `extend` can be a Node module and can only be specified in `spyd.*`, so we
// don't include it here.
const PATH_CONFIG_PROPS = new Set(['cwd', 'config', 'output', 'tasks'])
