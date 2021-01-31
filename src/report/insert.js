import { promises as fs } from 'fs'

import detectNewline from 'detect-newline'
import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

import { getNonInteractiveContents } from './content.js'

// Use the `insert` configuration property to insert content inside a file.
// We insert between any two lines with the tokens "spyd-start" and "spyd-end".
// This:
//  - works on any file format. User just needs to pick the right reporter.
//  - works with any comment type: #comment, <!-- comment -->, etc.
//  - does not require any parsing.
//  - does not require wrapping inserted content (e.g. in a code block).
//    This should be done by reporters.
export const insertContents = async function (contents) {
  const inserts = getInserts(contents)
  await Promise.all(
    inserts.map((insert) => insertOutputContents(contents, insert)),
  )
}

const getInserts = function (contents) {
  const inserts = contents.filter(hasInsert).map(getInsert)
  return [...new Set(inserts)]
}

const hasInsert = function ({ insert }) {
  return insert !== ''
}

const getInsert = function ({ insert }) {
  return insert
}

const insertOutputContents = async function (contents, insert) {
  const contentsA = contents.filter((content) => content.insert === insert)
  const contentA = getNonInteractiveContents(contentsA)
  const fileContent = await getFileContent(insert)
  const fileContentA = insertToFile(fileContent, contentA, insert)
  await writeFileContent(insert, fileContentA)
}

const getFileContent = async function (insert) {
  if (await isDirectory(insert)) {
    throw new UserError(
      `Invalid configuration property "insert" "${insert}": it must be a regular file, not a directory.`,
    )
  }

  try {
    return await fs.readFile(insert, 'utf8')
  } catch (error) {
    throw new UserError(`Could not read "insert" "${insert}"\n${error.message}`)
  }
}

const insertToFile = function (fileContent, content, insert) {
  const newline = detectNewline.graceful(fileContent)
  const lines = fileContent.split(newline)

  const contentA = replaceNewline(content, newline)
  const linesA = insertToLines(lines, contentA, insert)

  const fileContentA = linesA.join(newline)
  return fileContentA
}

const replaceNewline = function (content, newline) {
  const contentA = content.split(UNIX_NEWLINE).join(newline)
  return `${newline}${contentA}`
}

const UNIX_NEWLINE = '\n'

const insertToLines = function (lines, content, insert) {
  const startLine = getLineIndex(lines, insert, START_LINE_TOKEN)
  const endLine = getLineIndex(lines, insert, END_LINE_TOKEN)

  const start = lines.slice(0, startLine + 1)
  const end = lines.slice(endLine)
  return [...start, content, ...end]
}

// We require both delimiters so that user is aware that both should be moved
// when moving lines around
const getLineIndex = function (lines, insert, token) {
  const lineIndex = lines.findIndex((line) => line.includes(token))

  if (lineIndex === -1) {
    throw new UserError(
      `File "${insert}" should contain a line with the words ${token}`,
    )
  }

  return lineIndex
}

const START_LINE_TOKEN = 'spyd-start'
const END_LINE_TOKEN = 'spyd-end'

const writeFileContent = async function (insert, fileContent) {
  try {
    await writeFileAtomic(insert, fileContent)
  } catch (error) {
    throw new UserError(`Could not write to file "${insert}"\n${error.message}`)
  }
}
