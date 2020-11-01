import { readFile } from 'fs'
import { promisify } from 'util'

const pReadFile = promisify(readFile)

// Retrieve structured output.
// We use a single JSON file because parsing/serializing is not CPU intensive.
// Streaming results would provide with better progress reporting, but would
// be harder to implement for reporters and force them to stop benchmarking
// at regular intervals, which might increase variance.
export const getResult = async function (resultFile, failed) {
  try {
    const rawResult = await pReadFile(resultFile, 'utf8')
    const result = JSON.parse(rawResult)
    return result
  } catch (error) {
    return handleResultError(error, failed)
  }
}

// Process might fail before writing error result
const handleResultError = function (error, failed) {
  if (failed) {
    return {}
  }

  throw error
}
