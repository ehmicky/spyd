import { stdout } from 'process'
import { promisify } from 'util'

import { isDirectory } from 'path-type'
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

  if (await isDirectory(output)) {
    throw new UserError(
      `Invalid configuration property "output" "${output}": it must be a regular file, not a directory.`,
    )
  }

  try {
    await writeFileAtomic(output, nonInteractiveContent)
  } catch (error) {
    throw new UserError(
      `Could not write to "output" "${output}"\n${error.message}`,
    )
  }
}
