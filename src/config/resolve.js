import { dirname, resolve } from 'path'

import mapObj from 'map-obj'

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

export const resolveConfigPaths = function (config, baseDir) {
  return mapObj(config, (propName, value) =>
    resolveConfigProp({ propName, value, baseDir }),
  )
}

const resolveConfigProp = function ({ propName, value, baseDir }) {
  if (!PATH_CONFIG_PROPS.has(propName) || typeof value !== 'string') {
    return [propName, value]
  }

  const resolvedValue = resolve(baseDir, value)
  return [propName, resolvedValue]
}

// `extend` can be a Node module and can only be specified in `spyd.*`, so we
// don't include it here.
const PATH_CONFIG_PROPS = new Set(['config', 'output', 'insert'])
