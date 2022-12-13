import { getSharedConfig } from './shared.js'

// Normalize options for `addPlugins()`
export const normalizeMultipleOpts = ({
  name = 'plugins',
  duplicates = false,
  ...opts
}) => {
  const optsA = normalizeSingleOpts({ ...opts, name })
  return { ...optsA, duplicates }
}

// Normalize options for `addPlugin()`.
// We purposely do not assign default values to `shape` and `shared` since:
//  - `undefined` means no validation is performed, including unknown properties
//    check
//  - While an empty array means we validate that no properties exist
export const normalizeSingleOpts = ({
  name = 'plugin',
  modulePrefix,
  pluginProp = 'plugin',
  builtins = {},
  shape,
  shared,
  sharedConfig = {},
  sharedConfigName = 'sharedConfig',
  prefix,
  context,
  cwd,
  keywords,
}) => {
  const { sharedConfig: sharedConfigA, sharedPropNames } = getSharedConfig(
    sharedConfig,
    shared,
  )
  return {
    name,
    modulePrefix,
    pluginProp,
    builtins,
    shape,
    shared,
    sharedConfig: sharedConfigA,
    sharedConfigName,
    sharedPropNames,
    prefix,
    context,
    cwd,
    keywords,
  }
}
