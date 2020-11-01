import { stdout } from 'process'
import { promisify } from 'util'

import writeFileAtomic from 'write-file-atomic'

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
    await promisify(stdout.write.bind(stdout))(`\n${interactiveContent}\n`)
    return
  }

  await writeFileContent(output, nonInteractiveContent)
}

const writeFileContent = async function (output, nonInteractiveContent) {
  try {
    await writeFileAtomic(output, nonInteractiveContent)
  } catch (error) {
    throw new Error(`Could not write to file '${output}'\n${error.message}`)
  }
}
