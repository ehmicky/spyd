import { getSharedConfig } from './shared.js'

// Normalize options for `addPlugins()`
export const normalizeMultipleOpts = function ({
  name = 'plugins',
  duplicates = false,
  ...opts
}) {
  const optsA = normalizeSingleOpts({ ...opts, name })
  return { ...optsA, duplicates }
}

// Normalize options for `addPlugin()`
export const normalizeSingleOpts = function ({
  name = 'plugin',
  modulePrefix,
  pluginProp = 'plugin',
  builtins = {},
  shape = [],
  item = [],
  sharedConfig = {},
  context,
  cwd,
}) {
  const { sharedConfig: sharedConfigA, sharedPropNames } = getSharedConfig(
    sharedConfig,
    item,
  )
  return {
    name,
    modulePrefix,
    pluginProp,
    builtins,
    shape,
    item,
    sharedConfig: sharedConfigA,
    sharedPropNames,
    context,
    cwd,
  }
}
