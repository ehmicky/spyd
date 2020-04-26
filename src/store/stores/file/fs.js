import { promises as fs } from 'fs'

import pathExists from 'path-exists'
import writeFileAtomic from 'write-file-atomic'

// Retrieve benchmarks from filesystem
export const getBenchmarks = async function (dir) {
  const dataFile = await getDataFile(dir)

  if (!(await pathExists(dataFile))) {
    return []
  }

  const content = await fs.readFile(dataFile, 'utf8')
  const benchmarks = JSON.parse(content)
  return benchmarks
}

// Persist benchmarks from filesystem
export const setBenchmarks = async function (dir, benchmarks) {
  const dataFile = await getDataFile(dir)
  const content = JSON.stringify(benchmarks, undefined, 2)
  await writeFileAtomic(dataFile, `${content}\n`)
}

const getDataFile = async function (dir) {
  await fs.mkdir(dir, { recursive: true })
  return `${dir}/${DATA_FILE}`
}

const DATA_FILE = 'data.json'
