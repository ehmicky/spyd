import { cwd as getCwd } from 'process'

import isPlainObj from 'is-plain-obj'

import { getDefaultId } from '../history/merge/id.js'
import { isTtyInput } from '../report/tty.js'
import { cleanObject } from '../utils/clean.js'

// Add default configuration properties
export const addDefaultConfig = function (config, command) {
  const defaultConfig = getDefaultConfig(config, command)
  return cleanObject({ ...defaultConfig, ...config })
}

const getDefaultConfig = function (config, command) {
  return {
    cwd: getCwd(),
    force: !isTtyInput(),
    merge: getDefaultId(),
    showMetadata: METADATA_COMMANDS.has(command),
    showSystem: getDefaultShowSystem(config),
  }
}

const getDefaultShowSystem = function ({ system = {} }) {
  return isPlainObj(system) && Object.keys(system).length !== 0
}

const METADATA_COMMANDS = new Set(['show', 'remove'])
