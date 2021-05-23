import { resolve } from 'path'

import { has, get, set } from 'dot-prop'

// Resolve configuration relative file paths to absolute paths.
// When resolving configuration relative file paths:
//   - The CLI and programmatic flags always use the current directory.
//      - The `cwd` configuration property is not used since it might be
//        confusing:
//         - `cwd` flag would be relative to the current directory while other
//           flags would be relative to the `cwd` flag
//         - While the `cwd` flag would impact other flags, `cwd` in `spyd.*`
//           would not
//   - The files in `spyd.*` use the configuration file's directory instead.
//      - We do this since this is what most users would expect.
//   - This applies to the `config` and `tasks` configuration properties
//      - I.e. the default value uses `cwd` since it is not in any file, but
//        it uses the file's directory otherwise.
// In contrast, the `cwd` flag:
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
//     example using the current file's path (e.g. `__filename|__dirname`)
export const setConfigAbsolutePaths = function (config, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return PATH_CONFIG_PROPS.reduce(
    setConfigAbsolutePath.bind(undefined, configInfosA),
    config,
  )
}

const PATH_CONFIG_PROPS = ['cwd', 'output', 'tasks']

const setConfigAbsolutePath = function (configInfos, config, propName) {
  const value = get(config, propName)

  if (value === undefined) {
    return config
  }

  const base = getBase(configInfos, propName)
  const valueA = Array.isArray(value)
    ? value.map((item) => resolve(base, item))
    : resolve(base, value)
  return set(config, propName, valueA)
}

// Properties assigned as default values do not have corresponding `configInfos`
// and use process.cwd() as base.
const getBase = function (configInfos, propName) {
  const configInfo = configInfos.find(({ configContents }) =>
    has(configContents, propName),
  )
  return configInfo === undefined ? '.' : configInfo.base
}
