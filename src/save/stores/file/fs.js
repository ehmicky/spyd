import { promisify } from 'util'
import { readFile } from 'fs'

import writeFileAtomic from 'write-file-atomic'
import pathExists from 'path-exists'
import makeDir from 'make-dir'

const pReadFile = promisify(readFile)

// Retrieve benchmarks from filesystem
export const getBenchmarks = async function(dataDir) {
  const dataFile = await getDataFile(dataDir)

  if (!(await pathExists(dataFile))) {
    return []
  }

  const content = await pReadFile(dataFile, 'utf-8')
  const { benchmarks } = JSON.parse(content)
  return benchmarks
}

// Persist benchmarks from filesystem
export const setBenchmarks = async function(dataDir, benchmarks) {
  const dataFile = await getDataFile(dataDir)
  const content = JSON.stringify({ benchmarks }, null, 2)
  await writeFileAtomic(dataFile, `${content}\n`)
}

const getDataFile = async function(dataDir) {
  if (!(await pathExists(dataDir))) {
    // TODO: replace with `util.promisify(fs.mkdir)(cacheDir,{recursive: true})`
    // after dropping support for Node 8/9
    await makeDir(dataDir)
  }

  return `${dataDir}/${DATA_FILE}`
}

const DATA_FILE = 'data.json'
