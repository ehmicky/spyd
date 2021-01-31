import { stdout } from 'process'
import { promisify } from 'util'

import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

import {
  getInteractiveContent,
  getNonInteractiveContent,
  hasContent,
} from './content.js'
import { addPadding } from './utils/indent.js'

// Print result to file or to terminal based on the `output` configuration
// property
export const printContent = async function (content, { output, colors }) {
  if (!hasContent(content) || output === '') {
    return
  }

  if (output === undefined) {
    await printToTerminal(content, colors)
    return
  }

  await writeFileContent(content, output, colors)
}

const printToTerminal = async function (content, colors) {
  const interactiveContent = getInteractiveContent(content, colors)
  const interactiveContentA = addPadding(interactiveContent)
  await promisify(stdout.write.bind(stdout))(interactiveContentA)
}

const writeFileContent = async function (content, output, colors) {
  const nonInteractiveContent = getNonInteractiveContent(content, colors)

  try {
    await writeFileAtomic(output, nonInteractiveContent)
  } catch (error) {
    throw new UserError(`Could not write to file '${output}'\n${error.message}`)
  }
}
