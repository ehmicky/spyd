import { promises as fs } from 'fs'
import { dirname } from 'path'

import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { printToStdout } from '../tty.js'

import { detectInsert, insertContents } from './insert.js'

// `output` path is normalized, but some of its values are not file paths
export const isOutputPath = function (output) {
  return !OUTPUT_SPECIAL_VALUES.has(output)
}

const OUTPUT_SPECIAL_VALUES = new Set(['stdout', 'external'])
export const DEFAULT_REPORTER_OUTPUT = 'stdout'

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
    throw wrapError(
      error,
      `Could not write to "output" "${output}"\n`,
      UserError,
    )
  }
}
