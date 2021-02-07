import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'
import { groupBy } from '../utils/group.js'

import { getTtyContents, getNonTtyContents } from './content.js'
import { printToTty } from './tty.js'

// Print result to file or to terminal based on the `output` configuration
// property
export const printContents = async function (contents) {
  const contentsA = contents.filter(hasOutput)
  await printOutputsContents(contentsA)
  await printTtyContent(contentsA)
}

// Output with "" is silent. This is useful when using "insert" and no TTY
// output is wanted.
const hasOutput = function ({ output }) {
  return output !== ''
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

  try {
    await writeFileAtomic(output, nonTtyContents)
  } catch (error) {
    throw new UserError(
      `Could not write to "output" "${output}"\n${error.message}`,
    )
  }
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

const isTtyContent = function ({ output }) {
  return output === undefined
}
