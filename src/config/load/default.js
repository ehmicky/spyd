import { basename } from 'path'

import { lookupFiles } from '../lookup.js'
import { CLI_FLAGS_BASE } from '../normalize/path.js'

import { getConfigFilenames } from './contents.js'
import { isNpxCall } from './npx.js'

// Retrieve the default value for the `config` CLI flag
export const getDefaultConfig = async function () {
  if (isNpxCall()) {
    return []
  }

  const defaultConfigFilenames = getConfigFilenames()
  return await lookupFiles(
    (filePath) => defaultConfigFilenames.includes(basename(filePath)),
    CLI_FLAGS_BASE,
  )
}
