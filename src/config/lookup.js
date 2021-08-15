import { promises as fs } from 'fs'

import findUp from 'find-up'
import { pathExists } from 'path-exists'

import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

import { CONFIG_EXTENSIONS } from './contents.js'

// The default values for `config` and `tasks` look for `spyd.*` and `tasks.*`
// in the current or parent directories.
// They can be located in:
//  - A `packages/spyd-config-*/spyd.*`: for shared configurations using a
//    monorepo
//  - A `benchmark` directory: for grouping benchmark-related files.
//  - Any other directory: for on-the-fly benchmarking, or for
//    global/shared configuration.
// We only allow this for the top-level flags not inside configuration files to
// keep those self-contained.
export const resolveLookup = async function (base) {
  const lookupDirs = await getLookupDirs(base)
  const lookupFiles = lookupDirs.flatMap(getLookupFilesByExt)
  return await findUp(lookupFiles, { cwd: base })
}

// `find-up` does not support looking up for multiple files while also looking
// for patterns like `./packages/spyd-config-*`, so we need to call it twice.
const getLookupDirs = async function (base) {
  const configPackageDir = await findUp(testConfigPackageDir, {
    cwd: base,
    type: 'directory',
  })
  return configPackageDir === undefined
    ? DEFAULT_LOOKUP_DIRS
    : [...DEFAULT_LOOKUP_DIRS, configPackageDir]
}

// Order matters here
const DEFAULT_LOOKUP_DIRS = ['.', './benchmark']

const testConfigPackageDir = async function (dir) {
  const packagesDir = `${dir}/packages`

  if (!(await pathExists(packagesDir))) {
    return
  }

  const filenames = await fs.readdir(packagesDir)
  const filename = filenames.find(isConfigPackageDir)

  if (filename === undefined) {
    return
  }

  return `${packagesDir}/${filename}`
}

const isConfigPackageDir = function (filename) {
  return filename.startsWith(CONFIG_PLUGIN_TYPE.modulePrefix)
}

const getLookupFilesByExt = function (lookupDir) {
  return CONFIG_EXTENSIONS.map(
    (extName) => `${lookupDir}/${DEFAULT_CONFIG_BASENAME}${extName}`,
  )
}

const DEFAULT_CONFIG_BASENAME = 'spyd'
