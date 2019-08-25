import { promisify } from 'util'
import { readFile } from 'fs'

import writeFileAtomic from 'write-file-atomic'
import pathExists from 'path-exists'
import makeDir from 'make-dir'

const pReadFile = promisify(readFile)

// Retrieve benchmarks from filesystem
export const getBenchmarks = async function(dir) {
  const dataFile = await getDataFile(dir)

  if (!(await pathExists(dataFile))) {
    return []
  }

  const content = await pReadFile(dataFile, 'utf-8')
  const benchmarks = JSON.parse(content)
  return benchmarks
}

// Persist benchmarks from filesystem
export const setBenchmarks = async function(dir, benchmarks) {
  const dataFile = await getDataFile(dir)
  const content = JSON.stringify(benchmarks, null, 2)
  await writeFileAtomic(dataFile, `${content}\n`)
}

const getDataFile = async function(dir) {
  if (!(await pathExists(dir))) {
    // TODO: replace with `util.promisify(fs.mkdir)(cacheDir,{recursive: true})`
    // after dropping support for Node 8/9
    await makeDir(dir)
  }

  return `${dir}/${DATA_FILE}`
}

const DATA_FILE = 'data.json'
