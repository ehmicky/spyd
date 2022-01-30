import { basename } from 'path'

import { lookupFiles } from '../lookup.js'
import { CLI_FLAGS_BASE } from '../normalize/cwd.js'

import { getConfigFilenames } from './contents.js'

// Retrieve the default value for the `config` CLI flag
export const getDefaultConfig = async function () {
  const defaultConfigFilenames = getConfigFilenames()
  return await lookupFiles(
    (filePath) => defaultConfigFilenames.includes(basename(filePath)),
    CLI_FLAGS_BASE,
  )
}
