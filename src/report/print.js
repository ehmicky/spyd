import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'
import { groupBy } from '../utils/group.js'

import { getTtyContents, getNonTtyContents } from './content.js'
import { detectInsert, insertContents } from './insert.js'
import { printToTty } from './tty.js'

// Print result to file or to terminal based on the `output` configuration
// property.
// If the file contains the spyd-start and spyd-end comments, the content is
// inserted between them instead.
export const printContents = async function (contents) {
  await Promise.all([printTtyContent(contents), printOutputsContents(contents)])
}

// Print final report to terminal.
const printTtyContent = async function (contents) {
  const ttyContents = computeTtyContents(contents)

  if (ttyContents === undefined) {
    return
  }

  await printToTty(ttyContents)
}

// Retrieve contents printed in preview.
// Must be identical to the final contents.
export const computeTtyContents = function (contents) {
  const contentsA = contents.filter(isTtyContent)

  if (contentsA.length === 0) {
    return
  }

  return getTtyContents(contentsA)
}

// Write final report to files
const printOutputsContents = async function (contents) {
  const contentsA = contents.filter((content) => !isTtyContent(content))
  await Promise.all(
    Object.entries(groupBy(contentsA, 'output')).map(printOutputContents),
  )
}

const printOutputContents = async function ([output, contents]) {
  const nonTtyContents = getNonTtyContents(contents)

  if (await isDirectory(output)) {
    throw new UserError(
      `Invalid configuration property "output" "${output}": it must be a regular file, not a directory.`,
    )
  }

  const fileContent = await detectInsert(output)

  if (fileContent !== undefined) {
    await insertContents(output, nonTtyContents, fileContent)
    return
  }

  try {
    await writeFileAtomic(output, nonTtyContents)
  } catch (error) {
    throw new UserError(
      `Could not write to "output" "${output}"\n${error.message}`,
    )
  }
}

const isTtyContent = function ({ output }) {
  return output === undefined
}
