import { promises as fs } from 'fs'
import { relative, normalize, basename } from 'path'

import findUp from 'find-up'
import { pathExists } from 'path-exists'

import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

// The default values for `config` and `tasks` look for `spyd.*` and `tasks.*`
// in the current or parent directories.
// They can be located in:
//  - A `packages/spyd-config-*` directory: for shared configurations using a
//    monorepo
//  - A `benchmark` directory: for grouping benchmark-related files.
//  - Any other directory: for on-the-fly benchmarking, or for
//    global/shared configuration.
// We only allow this for the top-level flags not inside configuration files to
// keep those self-contained.
export const resolveLookup = async function (isMatchingPath, base) {
  const lookupDirs = await getLookupDirs(base)
  return await findUp(
    (baseA) => findMatchingPath(baseA, lookupDirs, isMatchingPath),
    { cwd: base },
  )
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
    : [...DEFAULT_LOOKUP_DIRS, relative(base, configPackageDir)]
}

// Order matters here
const DEFAULT_LOOKUP_DIRS = ['', 'benchmark']

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

const findMatchingPath = async function (base, lookupDirs, isMatchingPath) {
  const filePaths = await Promise.all(
    lookupDirs.map((lookupDir) => listLookupDir(base, lookupDir)),
  )
  const matchingPath = filePaths
    .flat()
    .find((filePath) => isMatchingPath(basename(filePath)))
  return matchingPath
}

const listLookupDir = async function (base, lookupDir) {
  const dirname = `${base}/${lookupDir}`

  if (!(await pathExists(dirname))) {
    return []
  }

  const filenames = await fs.readdir(dirname)
  return filenames.map((filename) => normalize(`${dirname}/${filename}`))
}
