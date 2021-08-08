import { promises as fs } from 'fs'

import { pathExists } from 'path-exists'
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
  const contentA = flattenArray(content)
  await writeFileAtomic(dataFile, `${contentA}\n`)
}

// Some arrays like `histogram` and `quantiles` are big. `JSON.serialize()`
// put each item in a separate line. We put those in a single line instead.
//  - This makes it easier to view the file
//  - This creates simpler git diffs
//  - This creates better git stats when it comes to amount of lines changes
// We only do this for arrays of simple types.
const flattenArray = function (content) {
  return content.replace(SIMPLE_ARRAY_REGEXP, flattenArrayItems)
}

// Matches `[ ... ]` but not `[ { ... } ]`
const SIMPLE_ARRAY_REGEXP = /\[([^\]{}]+)\]/gmu

const flattenArrayItems = function (_, match) {
  return `[${match.replace(WHITESPACES_REGEXP, ' ').trim()}]`
}

const WHITESPACES_REGEXP = /\s+/gmu

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
