import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

import { getTtyContents, getNonTtyContents } from './content.js'
import { printToTty } from './tty.js'

// Print result to file or to terminal based on the `output` configuration
// property
export const printContents = async function (contents) {
  const contentsA = contents.filter(hasOutput)
  const nonTtyContents = contentsA.filter((content) => !isTtyContent(content))

  const outputs = getOutputs(nonTtyContents)
  await Promise.all(
    outputs.map((output) => printOutputContents(nonTtyContents, output)),
  )

  await printTtyContent(contentsA)
}

// Output with "" is silent. This is useful when using "insert" and no TTY
// output is wanted.
const hasOutput = function ({ output }) {
  return output !== ''
}

const isTtyContent = function ({ output }) {
  return output === undefined
}

const getOutputs = function (contents) {
  const outputs = contents.map(getOutput)
  return [...new Set(outputs)]
}

const getOutput = function ({ output }) {
  return output
}

const printOutputContents = async function (contents, output) {
  const contentsA = contents.filter((content) => content.output === output)
  await writeFileContent(contentsA, output)
}

// Print final report to terminal
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

// Write final report to file
const writeFileContent = async function (contents, output) {
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
