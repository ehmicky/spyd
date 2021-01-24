import { resolve } from 'path'

import mapObj from 'map-obj'

import { resolveTasks } from '../run/resolve.js'

// Resolve configuration relative file paths to absolute paths
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
