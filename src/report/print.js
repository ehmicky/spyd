import { stdout } from 'process'
import { promisify } from 'util'

import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

import { addPadding } from './utils/indent.js'

// Print reporting result to file or to terminal based on the `output` option
export const printContent = async function ({
  interactiveContent,
  nonInteractiveContent,
  output,
}) {
  if (output === '') {
    return
  }

  if (output === '-') {
    return printToTerminal(interactiveContent)
  }

  await writeFileContent(output, nonInteractiveContent)
}

const printToTerminal = async function (interactiveContent) {
  const interactiveContentA = addPadding(interactiveContent)
  await promisify(stdout.write.bind(stdout))(interactiveContentA)
}

const writeFileContent = async function (output, nonInteractiveContent) {
  try {
    await writeFileAtomic(output, nonInteractiveContent)
  } catch (error) {
    throw new UserError(`Could not write to file '${output}'\n${error.message}`)
  }
}
