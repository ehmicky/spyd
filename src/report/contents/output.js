import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../../error/main.js'
import { printToStdout } from '../tty.js'

import { detectInsert, insertContents } from './insert.js'

// `output` path is normalized, but some of its values are not file paths
export const normalizeOutputPath = (output) =>
  OUTPUT_SPECIAL_VALUES.has(output) ? undefined : ['file', 'write']

const OUTPUT_SPECIAL_VALUES = new Set(['stdout', 'external'])
export const DEFAULT_REPORTER_OUTPUT = 'stdout'

// Print result to file or to terminal based on the `output` configuration
// property.
// If the file contains the spyd-start and spyd-end comments, the content is
// inserted between them instead.
export const outputContents = async (contents) => {
  await Promise.all(contents.map(outputContent))
}

const outputContent = async ({ content, output }) => {
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

const overwriteContents = async (output, content) => {
  const outputDir = dirname(output)
  await mkdir(outputDir, { recursive: true })

  try {
    await writeFileAtomic(output, content)
  } catch (cause) {
    throw new UserError(`Could not write to "output" "${output}"`, { cause })
  }
}
