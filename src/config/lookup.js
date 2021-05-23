import { promises as fs } from 'fs'

import findUp from 'find-up'
import pathExists from 'path-exists'

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
  const lookupFiles = await getLookupFiles(base)
  return await findUp(lookupFiles, { cwd: base })
}

const getLookupFiles = async function (base) {
  const configPackageDir = await getConfigPackageDir(base)
  const lookupDirs =
    configPackageDir === undefined
      ? DEFAULT_CONFIG
      : [...DEFAULT_CONFIG, `${configPackageDir}/spyd`]
  return lookupDirs.flatMap(getLookupFilesByExt)
}

// We look inside monorepo `packages/spyd-config-*/spyd.*`
const getConfigPackageDir = async function (base) {
  return await findUp(testConfigPackageDir, { cwd: base, type: 'directory' })
}

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

// Order matters here
const DEFAULT_CONFIG = ['./spyd', './benchmark/spyd']

const getLookupFilesByExt = function (filePath) {
  return CONFIG_EXTENSIONS.map((extName) => `${filePath}${extName}`)
}
