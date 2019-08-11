import { normalize } from 'path'

import pkgDir from 'pkg-dir'

// Add default value to `data' option
export const normalizeData = async function({ data: dataDir, cwd, ...opts }) {
  const dataDirA = await getDataDir(dataDir, cwd)
  const dataDirB = normalize(dataDirA)
  return { ...opts, dataDir: dataDirB, cwd }
}

const getDataDir = async function(dataDir, cwd) {
  if (dataDir !== undefined) {
    return dataDir
  }

  const dataRoot = await getDataRoot(cwd)
  const dataDirA = `${dataRoot}/${DATA_DIRNAME}`
  return dataDirA
}

const getDataRoot = async function(cwd) {
  const dataRoot = await pkgDir(cwd)

  if (dataRoot === undefined) {
    return cwd
  }

  return dataRoot
}

const DATA_DIRNAME = 'spyd'
