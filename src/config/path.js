import { resolve } from 'path'

import dotProp from 'dot-prop'

// Resolve configuration relative file paths to absolute paths.
// When resolving configuration relative file paths:
//   - The CLI and programmatic flags always use the current directory.
//      - This includes flags' default values, including `config` and `tasks`
//      - The `cwd` configuration property is not used since it might be
//        confusing:
//         - `cwd` flag would be relative to the current directory while other
//           flags would be relative to the `cwd` flag
//         - While the `cwd` flag would impact other flags, `cwd` in `spyd.*`
//           would not
//   - The files in `spyd.*` use the configuration file's directory instead.
//      - We do this since this is what most users would expect.
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
//     example using the current file's path (e.g. `import.meta.url`)
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
  const value = dotProp.get(config, propName)

  if (shouldNotSet(value, propName)) {
    return config
  }

  const base = getBase(configInfos, propName)
  const valueA = Array.isArray(value)
    ? value.map((item) => resolve(base, item))
    : resolve(base, value)
  return dotProp.set(config, propName, valueA)
}

// Some properties like `output` are not always file paths
const shouldNotSet = function (value, propName) {
  return value === undefined || (propName === 'output' && value === 'stdout')
}

// Properties assigned as default values do not have corresponding `configInfos`
//  - By default, they use the top-level config file's directory as base
//  - If none, they use process.cwd() instead
const getBase = function (configInfos, propName) {
  const configInfo = configInfos.find(({ configContents }) =>
    dotProp.has(configContents, propName),
  )

  if (configInfo !== undefined) {
    return configInfo.base
  }

  const [, topLevelConfigInfo] = configInfos

  if (topLevelConfigInfo !== undefined) {
    return topLevelConfigInfo.base
  }

  return '.'
}
