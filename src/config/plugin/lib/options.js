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

// Normalize options for `addPlugin()`.
// We purposely do not assign default values to `shape` and `item` since:
//  - `undefined` means no validation is performed, including unknown properties
//    check
//  - While an empty array means we validate that no properties exist
export const normalizeSingleOpts = function ({
  name = 'plugin',
  modulePrefix,
  pluginProp = 'plugin',
  builtins = {},
  shape,
  item,
  sharedConfig = {},
  sharedConfigName = 'sharedConfig',
  prefix,
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
    sharedConfigName,
    sharedPropNames,
    prefix,
    context,
    cwd,
  }
}
