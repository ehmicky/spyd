import { stdout } from 'process'
import { promisify } from 'util'

import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

import { getTtyContents, getNonTtyContents } from './content.js'

// Print result to file or to terminal based on the `output` configuration
// property
export const printContents = async function (contents) {
  const outputs = getOutputs(contents)
  await Promise.all(
    outputs.map((output) => printOutputContents(contents, output)),
  )
}

const getOutputs = function (contents) {
  const outputs = contents.filter(hasOutput).map(getOutput)
  return [...new Set(outputs)]
}

// Output with "" is silent. This is useful when using "insert" and no TTY
// output is wanted.
const hasOutput = function ({ output }) {
  return output !== ''
}

const getOutput = function ({ output }) {
  return output
}

const printOutputContents = async function (contents, output) {
  const contentsA = contents.filter((content) => content.output === output)

  if (output === undefined) {
    await printToTerminal(contentsA)
    return
  }

  await writeFileContent(contentsA, output)
}

// Retrieve contents printed in preview.
// Must be identical to the final contents.
export const getPreviewReport = function (contents) {
  const contentsA = contents.filter(hasTerminalOutput)

  if (contentsA.length === 0) {
    return
  }

  return getTtyContents(contentsA)
}

const hasTerminalOutput = function ({ output }) {
  return output === undefined
}

const printToTerminal = async function (contents) {
  const ttyContents = getTtyContents(contents)
  await promisify(stdout.write.bind(stdout))(ttyContents)
}

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
