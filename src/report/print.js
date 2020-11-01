import { stdout } from 'process'
import { promisify } from 'util'

import writeFileAtomic from 'write-file-atomic'

// Print reporting result to file or to terminal based on the `output` option
export const print = async function (content, output) {
  if (output === '') {
    return
  }

  const contentA = addFinalNewline(content)

  if (output === '-') {
    await promisify(stdout.write.bind(stdout))(contentA)
    return
  }

  await writeFileContent(output, contentA)
}

const addFinalNewline = function (content) {
  if (content.endsWith('\n')) {
    return content
  }

  return `${content}\n`
}

const writeFileContent = async function (file, content) {
  try {
    await writeFileAtomic(file, content)
  } catch (error) {
    throw new Error(`Could not write to file '${file}'\n${error.message}`)
  }
}
