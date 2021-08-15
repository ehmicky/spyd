import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'
import { groupBy } from '../utils/group.js'

import { detectInsert, insertContents } from './insert.js'
import { printToStdout } from './tty.js'
import { addPadding } from './utils/indent.js'

// Print result to file or to terminal based on the `output` configuration
// property.
// If the file contains the spyd-start and spyd-end comments, the content is
// inserted between them instead.
export const outputContents = async function (contents) {
  await Promise.all(
    Object.entries(groupBy(contents, 'output')).map(printContents),
  )
}

const printContents = async function ([output, contents]) {
  if (output === 'stdout') {
    await outputStdoutContents(contents)
    return
  }

  await outputFileContents(output, contents)
}

// Print final report to terminal.
const outputStdoutContents = async function (contents) {
  const stdoutContents = getStdoutContents(contents)
  await printToStdout(stdoutContents)
}

export const getStdoutContents = function (contents) {
  const contentsString = joinContents(contents)
  const stdoutContents = addPadding(contentsString)
  return stdoutContents
}

const outputFileContents = async function (output, contents) {
  if (await isDirectory(output)) {
    throw new UserError(
      `Invalid configuration property "output" "${output}": it must be a regular file, not a directory.`,
    )
  }

  const contentsString = joinContents(contents)
  const fileContent = await detectInsert(output)

  if (fileContent !== undefined) {
    await insertContents(output, contentsString, fileContent)
    return
  }

  try {
    await writeFileAtomic(output, contentsString)
  } catch (error) {
    throw new UserError(
      `Could not write to "output" "${output}"\n${error.message}`,
    )
  }
}

const joinContents = function (contents) {
  return contents.map(getContentProperty).join(CONTENTS_DELIMITER)
}

const getContentProperty = function ({ content }) {
  return content
}

// It is possible to use "output" with multiple reporters at once
const CONTENTS_DELIMITER = '\n'
