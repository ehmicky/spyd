import { promises as fs } from 'fs'

import pathExists from 'path-exists'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

// Retrieve results from filesystem
export const getResults = async function (dir) {
  const dataFile = await getDataFile(dir)

  if (!(await pathExists(dataFile))) {
    return []
  }

  const content = await fs.readFile(dataFile, 'utf8')
  const results = JSON.parse(content)
  return results
}

// Persist results from filesystem
export const setResults = async function (dir, results) {
  const dataFile = await getDataFile(dir)
  const content = JSON.stringify(results, undefined, 2)
  await writeFileAtomic(dataFile, `${content}\n`)
}

const getDataFile = async function (dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    throw new UserError(
      `Could not create history directory "${dir}"\n${error.message}`,
    )
  }

  return `${dir}/${DATA_FILE}`
}

const DATA_FILE = 'history.json'
