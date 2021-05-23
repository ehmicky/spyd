import { basename, dirname } from 'path'

import findUp from 'find-up'

import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

import { CONFIG_EXTENSIONS } from './contents.js'

// By default, we find the first `spyd.*` in the current or parent directories.
// They can be located in:
//  - A `packages/spyd-config-*/spyd.*`: for shared configurations using a
//    monorepo
//  - A `benchmark` directory: for grouping benchmark-related files.
//  - Any other directory: for on-the-fly benchmarking, or for
//    global/shared configuration.
export const resolveLookup = async function (base) {
  return await findUp(DEFAULT_CONFIG, { cwd: base })
}

const getMainDefaultPath = function (filePath, extName) {
  return `${filePath}${extName}`
}

// We look inside monorepo `packages/spyd-config-*/spyd.*` by default
const getPackagesDefaultPath = function (extName, dir) {
  return isConfigPackage(dir) ? `spyd${extName}` : undefined
}

const isConfigPackage = function (dir) {
  return (
    basename(dir).startsWith(CONFIG_PLUGIN_TYPE.modulePrefix) &&
    dirname(dir) === 'packages'
  )
}

const DEFAULT_CONFIG = [
  ...CONFIG_EXTENSIONS.map(getMainDefaultPath.bind(undefined, './spyd')),
  ...CONFIG_EXTENSIONS.map(
    getMainDefaultPath.bind(undefined, './benchmark/spyd'),
  ),
  ...CONFIG_EXTENSIONS.map((extName) =>
    getPackagesDefaultPath.bind(undefined, extName),
  ),
]
