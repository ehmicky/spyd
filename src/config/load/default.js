import { readdir } from 'node:fs/promises'
import { normalize, relative } from 'node:path'

import { findUp } from 'find-up'
import pLocate from 'p-locate'
import { pathExists } from 'path-exists'

import { CONFIG_FILENAMES } from './contents.js'
import { CONFIG_NPM_PREFIX } from './resolve.js'

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
// Retrieve the default value for the `config` CLI flag
export const getDefaultConfig = async ({ cwd }) => {
  const lookupDirs = await getLookupDirs(cwd)
  const matchedDir = await findUp((cwdA) => findMatchingDir(cwdA, lookupDirs), {
    cwd,
    type: 'directory',
  })
  return matchedDir === undefined ? [] : await findMatchingPaths(matchedDir)
}

// `find-up` does not support looking up for multiple files while also looking
// for patterns like `./packages/spyd-config-*`, so we need to call it twice.
const getLookupDirs = async (cwd) => {
  const configPackageDir = await findUp(testConfigPackageDir, {
    cwd,
    type: 'directory',
  })
  return configPackageDir === undefined
    ? DEFAULT_LOOKUP_DIRS
    : [...DEFAULT_LOOKUP_DIRS, relative(cwd, configPackageDir)]
}

// Order matters here
const DEFAULT_LOOKUP_DIRS = ['', 'benchmark']

const testConfigPackageDir = async (dir) => {
  const packagesDir = `${dir}/packages`

  if (!(await pathExists(packagesDir))) {
    return
  }

  const filenames = await readdir(packagesDir)
  const filename = filenames.find(isConfigPackageDir)

  if (filename === undefined) {
    return
  }

  return `${packagesDir}/${filename}`
}

const isConfigPackageDir = (filename) => filename.startsWith(CONFIG_NPM_PREFIX)

const findMatchingDir = async (cwd, lookupDirs) => {
  const lookupDirsA = lookupDirs.map((lookupDir) => `${cwd}/${lookupDir}`)
  return await pLocate(lookupDirsA, hasMatchingPath)
}

const hasMatchingPath = async (lookupDir) => {
  if (!(await pathExists(lookupDir))) {
    return false
  }

  const matchingPaths = await findMatchingPaths(lookupDir)
  return matchingPaths.length !== 0
}

const findMatchingPaths = async (lookupDir) => {
  const filenames = await readdir(lookupDir)
  return filenames
    .filter(isMatchingFilename)
    .map((filename) => normalize(`${lookupDir}/${filename}`))
}

const isMatchingFilename = (filePath) => CONFIG_FILENAMES.has(filePath)
