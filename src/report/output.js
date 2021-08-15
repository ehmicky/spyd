import { promises as fs } from 'fs'
import { dirname } from 'path'

import { isDirectory } from 'path-type'
import writeFileAtomic from 'write-file-atomic'

import { UserError } from '../error/main.js'
import { groupBy } from '../utils/group.js'

import { detectInsert, insertContents } from './insert.js'
import { serializeContents } from './serialize.js'
import { printToStdout } from './tty.js'

// Print result to file or to terminal based on the `output` configuration
// property.
// If the file contains the spyd-start and spyd-end comments, the content is
// inserted between them instead.
export const outputContents = async function (contents) {
  await Promise.all(
    Object.entries(groupBy(contents, 'output')).map(printContents),
  )
}

const printContents = async function ([output, contents]) {
  const contentsString = serializeContents(contents)

  if (output === 'stdout') {
    return await printToStdout(contentsString)
  }

  if (await isDirectory(output)) {
    throw new UserError(
      `Invalid configuration property "output" "${output}": it must be a regular file, not a directory.`,
    )
  }

  const fileContent = await detectInsert(output)

  if (fileContent !== undefined) {
    return await insertContents(output, contentsString, fileContent)
  }

  await overwriteContents(output, contentsString)
}

const overwriteContents = async function (output, contentsString) {
  const outputDir = dirname(output)
  await fs.mkdir(outputDir, { recursive: true })

  try {
    await writeFileAtomic(output, contentsString)
  } catch (error) {
    throw new UserError(
      `Could not write to "output" "${output}"\n${error.message}`,
    )
  }
}
