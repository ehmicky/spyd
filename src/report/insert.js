import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

const pReadFile = promisify(readFile)
const pWriteFile = promisify(writeFile)

// Use the `insert` option to insert content inside a file.
// We insert between any two lines with the tokens "spyd-start" and "spyd-end".
// This:
//  - works on any file format. User just needs to pick the right reporter.
//  - works with any comment type: #comment, <!-- comment -->, etc.
//  - does not require any parsing.
//  - does not require wrapping inserted content (e.g. in a code block).
//    This should be done by reporters.
export const insertContent = async function({ content, insert: file }) {
  if (file === undefined) {
    return
  }

  const fileContent = await getFileContent(file)
  const fileContentA = insertToFile(fileContent, content, file)
  await writeFileContent(file, fileContentA)
}

const getFileContent = async function(file) {
  try {
    return await pReadFile(file, 'utf8')
  } catch (error) {
    throw new Error(`Could not read file '${file}'\n\n${error.stack}`)
  }
}

const insertToFile = function(fileContent, content, file) {
  const newline = detectNewline(fileContent)
  const lines = fileContent.split(newline)

  const linesA = insertToLines(lines, content, file)

  const fileContentA = linesA.join(newline)
  return fileContentA
}

const detectNewline = function(fileContent) {
  if (fileContent.includes(WINDOWS_NEWLINE)) {
    return WINDOWS_NEWLINE
  }

  return UNIX_NEWLINE
}

const WINDOWS_NEWLINE = '\r\n'
const UNIX_NEWLINE = '\n'

const insertToLines = function(lines, content, file) {
  const startLine = getLineIndex(lines, file, START_LINE_TOKEN)
  const endLine = getLineIndex(lines, file, END_LINE_TOKEN)

  const start = lines.slice(0, startLine + 1)
  const end = lines.slice(endLine)
  return [...start, content, ...end]
}

// We require both delimiters so that user is aware that both should be moved
// when moving lines around
const getLineIndex = function(lines, file, token) {
  const lineIndex = lines.findIndex(line => line.includes(token))

  if (lineIndex === -1) {
    throw new TypeError(
      `File '${file}' should contain a line with the words ${token}`,
    )
  }

  return lineIndex
}

const START_LINE_TOKEN = 'spyd-start'
const END_LINE_TOKEN = 'spyd-end'

const writeFileContent = async function(file, fileContent) {
  try {
    await pWriteFile(file, fileContent)
  } catch (error) {
    throw new Error(`Could not write to file '${file}'\n\n${error.stack}`)
  }
}
