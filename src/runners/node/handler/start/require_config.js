import { pathToFileURL } from 'url'

import { wrapError } from '../../../../error/wrap.js'
import { ConfigError } from '../../../common/error.js'

// Use the `require` configuration property
export const useRequireConfig = async function (requireConfig) {
  await Promise.all(requireConfig.map(useRequiredModule))
}

const useRequiredModule = async function (requiredModule) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    await import(pathToFileURL(requiredModule))
  } catch (error) {
    throw wrapError(
      error,
      `Configuration property "runner.require" with value "${requiredModule}" could not be imported.\n`,
      ConfigError,
    )
  }
}

export const EXAMPLE_REQUIRE = 'ts-node/register'
