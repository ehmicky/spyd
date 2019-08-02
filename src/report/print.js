import { stdout } from 'process'
import { writeFile } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Print reporting result to file or to terminal based on the `output` option
export const print = async function({ content, output, insert }) {
  const contentA = addFinalNewline(content)

  const outputA = getOutput({ output, insert })

  if (outputA === '') {
    return
  }

  if (outputA === '-') {
    await promisify(stdout.write.bind(stdout))(contentA)
    return
  }

  await writeFileContent(outputA, contentA)
}

const addFinalNewline = function(content) {
  if (content.endsWith('\n')) {
    return content
  }

  return `${content}\n`
}

const getOutput = function({ output, insert }) {
  if (typeof output === 'string') {
    return output
  }

  if (insert !== undefined) {
    return ''
  }

  return '-'
}

const writeFileContent = async function(file, content) {
  try {
    await pWriteFile(file, content)
  } catch (error) {
    throw new Error(`Could not write to file '${file}'\n\n${error.stack}`)
  }
}
