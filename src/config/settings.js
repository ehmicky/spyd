import { resolve } from 'path'

import findUp from 'find-up'
import { isDirectory } from 'path-type'

import { UserError } from '../error/main.js'

// Retrieve `settings` configuration property, and resolve to an absolute path.
export const getSettings = async function (settings) {
  if (settings !== undefined) {
    return await getUserSettings(settings)
  }

  return await getDefaultSettings()
}

const getUserSettings = async function (settings) {
  const settingsA = resolve(settings)

  if (!(await isDirectory(settings))) {
    throw new UserError(`"settings" directory does not exist: ${settings}`)
  }

  return settingsA
}

// By default, we find the first `benchmark` directory.
const getDefaultSettings = async function () {
  const settings = await findUp(DEFAULT_SETTINGS, { type: 'directory' })

  if (settings === undefined) {
    throw new UserError(
      `You must either:
  - create a "${DEFAULT_SETTINGS}" directory
  - or specify the "settings" configuration property`,
    )
  }

  return settings
}

const DEFAULT_SETTINGS = 'benchmark'
