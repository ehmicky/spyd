import { readFile } from 'fs'
import { promisify } from 'util'

import { load as loadYaml, JSON_SCHEMA } from 'js-yaml'

const pReadFile = promisify(readFile)

// Load and parse benchmark YAML file
export const loadFile = async function(taskPath) {
  const content = await readTaskFile(taskPath)
  const entries = parseYaml(content)
  return entries
}

const readTaskFile = async function(taskPath) {
  try {
    return await pReadFile(taskPath, 'utf8')
  } catch (error) {
    throw new Error(`Could not read benchmark file\n\n${error.stack}`)
  }
}

const parseYaml = function(content) {
  try {
    return loadYaml(content, { schema: JSON_SCHEMA, onWarning })
  } catch (error) {
    throw new Error(`Invalid YAML\n\n${error.stack}`)
  }
}

const onWarning = function(error) {
  throw error
}
