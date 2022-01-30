import { has } from './lib/prop_path/get.js'

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
// Properties assigned as default values do not have corresponding `configInfos`
//  - By default, they use the top-level config file's directory as base
//  - If none, they use process.cwd() instead
export const getPropCwd = function (value, { path, context: { configInfos } }) {
  const configInfo = configInfos.find(({ configContents }) =>
    has(configContents, path),
  )

  if (configInfo !== undefined) {
    return configInfo.base
  }

  const [, topLevelConfigInfo] = configInfos

  if (topLevelConfigInfo !== undefined) {
    return topLevelConfigInfo.base
  }

  return DEFAULT_VALUES_BASE
}

// Base used to resolve file paths in default values when there is no config
// file
const DEFAULT_VALUES_BASE = '.'
// Base used to resolve file paths in CLI flags
export const CLI_FLAGS_BASE = '.'
// Base used to resolve file paths for the `tasks` default value lookup
// TODO: remove and use same logic as other configuration properties instead
export const DEFAULT_TASKS_BASE = '.'
// Base used to resolve plugin modules
export const PLUGINS_IMPORT_BASE = '.'
