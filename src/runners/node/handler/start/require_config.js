import { pathToFileURL } from 'node:url'

import { ConfigError } from '../../../common/error.js'

// Use the `require` configuration property
export const useRequireConfig = async function (requireConfig) {
  await Promise.all(requireConfig.map(useRequiredModule))
}

const useRequiredModule = async function (requiredModule) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    await import(pathToFileURL(requiredModule))
  } catch (cause) {
    throw new ConfigError(
      `Configuration property "runner.require" with value "${requiredModule}" could not be imported.`,
      { cause },
    )
  }
}

export const EXAMPLE_REQUIRE = 'ts-node/register'
