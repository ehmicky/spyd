import { normalize } from 'path'

import pkgDir from 'pkg-dir'

export const getDir = async function({ data: dir, cwd }) {
  const dirA = await getDefaultDir(dir, cwd)
  const dirB = normalize(dirA)
  return dirB
}

const getDefaultDir = async function(dir, cwd) {
  if (dir !== undefined) {
    return dir
  }

  const packageRoot = await getPackageRoot(cwd)
  const dorA = `${packageRoot}/${DATA_DIRNAME}`
  return dorA
}

const getPackageRoot = async function(cwd) {
  const packageRoot = await pkgDir(cwd)

  if (packageRoot === undefined) {
    return cwd
  }

  return packageRoot
}

const DATA_DIRNAME = 'spyd'
