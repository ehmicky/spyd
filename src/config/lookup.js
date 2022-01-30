import { promises as fs } from 'fs'
import { relative, normalize } from 'path'

import { findUp } from 'find-up'
import pLocate from 'p-locate'
import { pathExists } from 'path-exists'

import { CONFIG_PLUGIN_TYPE } from './plugin/types.js'

// The default values for `config` looks for `spyd.*` in the current or parent
// directories.
// They can be located in:
//  - A `packages/spyd-config-*` directory: for shared configurations using a
//    monorepo
//  - A `benchmark` directory: for grouping benchmark-related files.
//  - Any other directory: for on-the-fly benchmarking, or for
//    global/shared configuration.
// The reasons for that logic is that it:
//  - Ensures the same default value behavior and directories between different
//    configuration properties
//  - Avoids typing during on-the-fly benchmarking by allowing files to be in
//    the current directory
//  - Avoids having to configure file paths most of the time
//  - Enforces a preferred file structure and naming
//  - Works with shared `config`
//     - They might need to explicitly set some properties (especially `tasks`)
//       to avoid using the default value though, making them self-contained
//  - Works with multiple config files (thanks to concatenating `tasks` to an
//    array)
//  - Works with multiple runners
//  - Is extensible to other future file configuration properties
// For `config`:
//  - We only allow this for the top-level flags not inside configuration files
//    to keep those self-contained.
export const lookupFiles = async function (isMatchingPath, base) {
  const lookupDirs = await getLookupDirs(base)
  const matchedDir = await findUp(
    (baseA) => findMatchingDir(baseA, lookupDirs, isMatchingPath),
    { cwd: base, type: 'directory' },
  )
  return matchedDir === undefined
    ? []
    : await findMatchingPaths(matchedDir, isMatchingPath)
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

const findMatchingDir = async function (base, lookupDirs, isMatchingPath) {
  const lookupDirsA = lookupDirs.map((lookupDir) => `${base}/${lookupDir}`)
  return await pLocate(lookupDirsA, (lookupDirA) =>
    hasMatchingPath(lookupDirA, isMatchingPath),
  )
}

const hasMatchingPath = async function (lookupDir, isMatchingPath) {
  if (!(await pathExists(lookupDir))) {
    return false
  }

  const matchingPaths = await findMatchingPaths(lookupDir, isMatchingPath)
  return matchingPaths.length !== 0
}

const findMatchingPaths = async function (lookupDir, isMatchingPath) {
  const filenames = await fs.readdir(lookupDir)
  const filePaths = filenames.map((filename) =>
    normalize(`${lookupDir}/${filename}`),
  )
  return filePaths.filter(isMatchingPath)
}
