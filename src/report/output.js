import { promises as fs } from 'fs'
import { dirname } from 'path'

import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'

import { detectInsert, insertContents } from './insert.js'
import { printToStdout } from './tty.js'

// `output` path is normalized, but some of its values are not file paths
export const isOutputPath = function (output) {
  return !OUTPUT_SPECIAL_VALUES.has(output)
}

const OUTPUT_SPECIAL_VALUES = new Set(['stdout', 'external'])

// Print result to file or to terminal based on the `output` configuration
// property.
// If the file contains the spyd-start and spyd-end comments, the content is
// inserted between them instead.
export const outputContents = async function (contents) {
  await Promise.all(contents.map(outputContent))
}

const outputContent = async function ({ content, output }) {
  if (output === 'stdout') {
    await printToStdout(content)
    return
  }

  if (await isDirectory(output)) {
    throw new UserError(
      `Invalid configuration property "output" "${output}": it must be a regular file, not a directory.`,
    )
  }

  const fileContent = await detectInsert(output)

  if (fileContent !== undefined) {
    await insertContents(output, content, fileContent)
    return
  }

  await overwriteContents(output, content)
}

const overwriteContents = async function (output, content) {
  const outputDir = dirname(output)
  await fs.mkdir(outputDir, { recursive: true })

  try {
    await writeFileAtomic(output, content)
  } catch (error) {
    throw new UserError(
      `Could not write to "output" "${output}"\n${error.message}`,
    )
  }
}
