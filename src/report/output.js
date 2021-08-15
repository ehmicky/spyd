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
  await Promise.all([
    outputStdoutContents(contents),
    outputFilesContents(contents),
  ])
}

// Print final report to terminal.
const outputStdoutContents = async function (contents) {
  const stdoutContents = computeStdoutContents(contents)

  if (stdoutContents === undefined) {
    return
  }

  await printToStdout(stdoutContents)
}

// Retrieve contents printed in preview.
// Must be identical to the final contents.
export const computeStdoutContents = function (contents) {
  const contentsA = contents.filter(hasStdoutOutput)

  if (contentsA.length === 0) {
    return
  }

  const contentsString = joinContents(contents)
  return addPadding(contentsString)
}

// Write final report to files
const outputFilesContents = async function (contents) {
  const contentsA = contents.filter((content) => !hasStdoutOutput(content))
  await Promise.all(
    Object.entries(groupBy(contentsA, 'output')).map(outputFileContents),
  )
}

const outputFileContents = async function ([output, contents]) {
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

const hasStdoutOutput = function ({ output }) {
  return output === 'stdout'
}

const joinContents = function (contents) {
  return contents.map(getContentProperty).join(CONTENTS_DELIMITER)
}

const getContentProperty = function ({ content }) {
  return content
}

// It is possible to use "output" with multiple reporters at once
const CONTENTS_DELIMITER = '\n'
