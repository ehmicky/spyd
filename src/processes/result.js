import { readFile } from 'fs'
import { promisify } from 'util'

const pReadFile = promisify(readFile)

// Retrieve structured output.
export const getResult = async function (resultFile) {
  const rawResult = await pReadFile(resultFile, 'utf8')
  const result = JSON.parse(rawResult)
  return result
}
