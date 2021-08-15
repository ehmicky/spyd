import { resolve, basename } from 'path'

import dotProp from 'dot-prop'
import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'
import pReduce from 'p-reduce'

// Normalize all configuration file paths
export const normalizeConfigPaths = async function (config, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return await pReduce(
    PATH_CONFIG_PROPS,
    reduceConfigPath.bind(undefined, configInfosA),
    config,
  )
}

// List of all configuration properties that are file paths or globbing patterns
const PATH_CONFIG_PROPS = [
  { propName: 'cwd', globbing: false },
  {
    propName: 'output',
    globbing: false,
    isPath: (value) => value !== 'stdout',
  },
  { propName: 'tasks', globbing: true },
]

const reduceConfigPath = async function (
  configInfos,
  config,
  { propName, globbing, isPath },
) {
  const value = dotProp.get(config, propName)

  if (isNotPath(value, isPath)) {
    return config
  }

  const valueA = await normalizeConfigPath({
    value,
    propName,
    globbing,
    configInfos,
  })
  return dotProp.set(config, propName, valueA)
}

// Some properties like `output` are not always file paths
const isNotPath = function (value, isPath) {
  return value === undefined || (isPath !== undefined && !isPath(value))
}

const normalizeConfigPath = async function ({
  value,
  propName,
  globbing,
  configInfos,
}) {
  const base = getBase(configInfos, propName)

  if (globbing) {
    return await resolveGlobbing(value, base)
  }

  if (!Array.isArray(value)) {
    return setAbsolutePath(base, value)
  }

  const filePaths = value.map((item) => setAbsolutePath(base, item))
  return [...new Set(filePaths)]
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

// Resolve configuration properties that are globbing patterns.
// Also resolve to absolute file paths.
// Remove duplicates and temporary files.
const resolveGlobbing = async function (pattern, base) {
  const filePaths = await fastGlob(pattern, {
    cwd: base,
    absolute: true,
    unique: true,
  })
  return filePaths.filter((filePath) => isNotJunk(basename(filePath)))
}

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
const setAbsolutePath = function (base, filePath) {
  return resolve(base, filePath)
}
