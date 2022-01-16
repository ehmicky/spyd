import { basename } from 'path'

import { lookupFiles } from '../lookup.js'

import { getConfigFilenames } from './contents.js'
import { getConfigsInfos } from './info.js'
import { addNpxShortcut } from './npx.js'

// Load the main configuration file `spyd.*` and any parents.
// The configuration file is optional, so this can return an empty array.
// This allows benchmarking on-the-fly in a terminal without having to create a
// configuration file.
export const loadConfigFile = async function (config) {
  const topConfig = await getTopConfig(config, TOP_LEVEL_BASE)
  return await getConfigsInfos(topConfig, TOP_LEVEL_BASE)
}

const TOP_LEVEL_BASE = '.'

// Resolve `config` top-level flag
const getTopConfig = async function (config, base) {
  const configA = addNpxShortcut(config)

  if (configA === undefined) {
    return await resolveDefaultConfig(base)
  }

  return configA
}

const resolveDefaultConfig = async function (base) {
  const defaultConfigFilenames = getConfigFilenames()
  return await lookupFiles(
    (filePath) => defaultConfigFilenames.includes(basename(filePath)),
    base,
  )
}
