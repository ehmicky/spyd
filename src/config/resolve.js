import { resolve } from 'path'

import mapObj from 'map-obj'

// Resolve configuration relative file paths to absolute paths
// When resolving configuration relative file paths:
//   - The CLI and programmatic flags always use the current directory.
//     They do not use `--cwd` since it might be confusing.
//   - The files in `spyd.*` use the configuration file's directory instead.
//     We do this since this is probably what users would expect.
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
const PATH_CONFIG_PROPS = new Set([
  'cwd',
  'config',
  'output',
  'insert',
  'tasks',
])
