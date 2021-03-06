import { promises as fs } from 'fs'

import detectNewline from 'detect-newline'
import pathExists from 'path-exists'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

// By default, the `output` configuration property overwrites the file.
// However, contents can be inserted instead between any two lines with the
// tokens "spyd-start" and "spyd-end".
// This:
//  - works on any file format. User just needs to pick the right reporter.
//  - works with any comment type: #comment, <!-- comment -->, etc.
//  - does not require any parsing.
//  - does not require wrapping inserted content (e.g. in a code block).
//    This should be done by reporters.
export const detectInsert = async function (output) {
  if (!(await pathExists(output))) {
    return
  }

  const fileContent = await getFileContent(output)

  if (!fileContent.includes(START_LINE_TOKEN)) {
    return
  }

  return fileContent
}

const getFileContent = async function (output) {
  try {
    return await fs.readFile(output, 'utf8')
  } catch (error) {
    throw new UserError(`Could not read "output" "${output}"\n${error.message}`)
  }
}

export const insertContents = async function (output, contents, fileContent) {
  const newline = detectNewline.graceful(fileContent)
  const lines = fileContent.split(newline)

  const contentsA = replaceNewline(contents, newline)
  const linesA = insertToLines(lines, contentsA, output)

  const fileContentA = linesA.join(newline)
  await writeFileContent(output, fileContentA)
}

const replaceNewline = function (contents, newline) {
  const contentsA = contents.split(UNIX_NEWLINE).join(newline)
  return `${newline}${contentsA}`
}

const UNIX_NEWLINE = '\n'

// We require both delimiters so that user is aware that both should be moved
// when moving lines around
const insertToLines = function (lines, contents, output) {
  const startLine = getLineIndex(lines, START_LINE_TOKEN)
  const endLine = getLineIndex(lines, END_LINE_TOKEN)

  if (endLine === -1) {
    throw new UserError(
      `File "${output}" contains a "${START_LINE_TOKEN}" comment but is missing "${END_LINE_TOKEN}".`,
    )
  }

  if (endLine < startLine) {
    throw new UserError(
      `File "${output}" contains a "${START_LINE_TOKEN}" comment after "${END_LINE_TOKEN}".`,
    )
  }

  const start = lines.slice(0, startLine + 1)
  const end = lines.slice(endLine)
  return [...start, contents, ...end]
}

const getLineIndex = function (lines, token) {
  return lines.findIndex((line) => line.includes(token))
}

const START_LINE_TOKEN = 'spyd-start'
const END_LINE_TOKEN = 'spyd-end'

const writeFileContent = async function (output, fileContent) {
  try {
    await writeFileAtomic(output, fileContent)
  } catch (error) {
    throw new UserError(`Could not write to file "${output}"\n${error.message}`)
  }
}
