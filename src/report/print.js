import { stdout } from 'process'
import { writeFile } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Print reporting result to file or to terminal
export const print = async function({ content, reportOpt, output }) {
  if (!hasContent(content)) {
    return
  }

  const contentA = addFinalNewline(content)

  const outputA = getOutput(reportOpt, output)

  if (outputA === '') {
    return
  }

  if (outputA === '-') {
    stdout.write(contentA)
    return
  }

  await printToFile(outputA, contentA)
}

const hasContent = function(content) {
  return typeof content === 'string' && content.trim() !== ''
}

const addFinalNewline = function(content) {
  if (content.endsWith('\n')) {
    return content
  }

  return `${content}\n`
}

const getOutput = function(reportOpt, output) {
  if (typeof reportOpt.output === 'string') {
    return reportOpt.output
  }

  return output
}

const printToFile = async function(file, content) {
  try {
    await pWriteFile(file, content)
  } catch (error) {
    throw new Error(`Could not report to output '${file}'\n\n${error.stack}`)
  }
}
