import { dirname, resolve } from 'path'

import mapObj from 'map-obj'

import { resolveTasks } from './task.js'

// Resolve configuration relative file paths to absolute paths
// The CLI flags and environment variables use the current directory. However,
// in `spyd.*`, we use the configuration file's directory. We do this since this
// is probably what users would expect.
// We use the `spyd.*` directory as current directory for everything else,
// e.g. task processes. We use it because it is stable, predictable and easy
// to explain. We do not allow a `cwd` configuration property since there is
// no strong reason for it at the moment.
export const getCwd = function (configPath) {
  return dirname(configPath)
}

export const resolveConfigPaths = async function (config, cwd) {
  const configA = mapObj(config, (propName, value) => [
    propName,
    resolveConfigProp(propName, value, cwd),
  ])
  const configB = await resolveTasks(configA, cwd)
  return configB
}

// Resolve all file path configuration properties.
// Done recursively since some are objects.
const resolveConfigProp = function (propName, value, cwd) {
  if (!PATH_CONFIG_PROPS.has(propName) || value === undefined) {
    return value
  }

  return resolve(cwd, value)
}

// `extend` can be a Node module and can only be specified in `spyd.*`, so we
// don't include it here.
const PATH_CONFIG_PROPS = new Set(['config', 'output', 'insert'])
