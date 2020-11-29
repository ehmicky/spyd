import { promises as fs } from 'fs'

import detectNewline from 'detect-newline'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

// Use the `insert` configuration property to insert content inside a file.
// We insert between any two lines with the tokens "spyd-start" and "spyd-end".
// This:
//  - works on any file format. User just needs to pick the right reporter.
//  - works with any comment type: #comment, <!-- comment -->, etc.
//  - does not require any parsing.
//  - does not require wrapping inserted content (e.g. in a code block).
//    This should be done by reporters.
export const insertContent = async function (content, file) {
  if (file === undefined) {
    return
  }

  const fileContent = await getFileContent(file)
  const fileContentA = insertToFile(fileContent, content, file)
  await writeFileContent(file, fileContentA)
}

const getFileContent = async function (file) {
  try {
    return await fs.readFile(file, 'utf8')
  } catch (error) {
    throw new UserError(`Could not read file '${file}'\n${error.message}`)
  }
}

const insertToFile = function (fileContent, content, file) {
  const newline = detectNewline.graceful(fileContent)
  const lines = fileContent.split(newline)

  const contentA = replaceNewline(content, newline)
  const linesA = insertToLines(lines, contentA, file)

  const fileContentA = linesA.join(newline)
  return fileContentA
}

const replaceNewline = function (content, newline) {
  const contentA = content.split(UNIX_NEWLINE).join(newline)
  return `${newline}${contentA}`
}

const UNIX_NEWLINE = '\n'

const insertToLines = function (lines, content, file) {
  const startLine = getLineIndex(lines, file, START_LINE_TOKEN)
  const endLine = getLineIndex(lines, file, END_LINE_TOKEN)

  const start = lines.slice(0, startLine + 1)
  const end = lines.slice(endLine)
  return [...start, content, ...end]
}

// We require both delimiters so that user is aware that both should be moved
// when moving lines around
const getLineIndex = function (lines, file, token) {
  const lineIndex = lines.findIndex((line) => line.includes(token))

  if (lineIndex === -1) {
    throw new UserError(
      `File '${file}' should contain a line with the words ${token}`,
    )
  }

  return lineIndex
}

const START_LINE_TOKEN = 'spyd-start'
const END_LINE_TOKEN = 'spyd-end'

const writeFileContent = async function (file, fileContent) {
  try {
    await writeFileAtomic(file, fileContent)
  } catch (error) {
    throw new UserError(`Could not write to file '${file}'\n${error.message}`)
  }
}
