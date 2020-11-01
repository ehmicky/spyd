import { platform, env } from 'process'

import osName from 'os-name'

// The `system` option can contain some `$VAR` that are substituted:
//  - environment variables
//  - {{os}}, {{os_full}}
//  - runner-specific variables like {{node_major}}
export const replaceSystemVars = async function (title, run) {
  // TODO: use String.matchAll after dropping support for Node <12
  const rawTokens = title.match(SYSTEM_VAR_REGEXP)

  if (rawTokens === null) {
    return title
  }

  const systemVars = getSystemVars(run)
  const tokens = await Promise.all(
    rawTokens.map((rawToken) => getToken(rawToken, systemVars)),
  )
  const titleA = tokens.reduce(replaceToken, title)
  return titleA
}

const SYSTEM_VAR_REGEXP = /\{\{(\w+)\}\}/gu

// Retrieve all available variables
const getSystemVars = function (run) {
  const runSystemVars = Object.assign({}, ...run.map(getRunSystemVars))
  return { ...runSystemVars, ...SYSTEM_VARS }
}

const getRunSystemVars = function ({ system }) {
  return system
}

const SYSTEM_VARS = {
  os() {
    return OS[platform]
  },
  os_full() {
    return osName()
  },
}

const OS = {
  linux: 'Linux',
  darwin: 'macOS X',
  win32: 'Windows',
  android: 'Android',
  sunos: 'SunOS',
  aix: 'AIX',
  freebsd: 'FreeBSD',
  openbsd: 'OpenBSD',
}

const getToken = async function (rawToken, systemVars) {
  const name = rawToken.replace(SYSTEM_VAR_REGEXP, '$1')
  const value = await getTokenValue({ name, rawToken, systemVars })
  return { name, value }
}

const getTokenValue = async function ({ name, rawToken, systemVars }) {
  const getValue = systemVars[name]

  if (getValue === undefined) {
    return env[name]
  }

  try {
    return await getValue()
  } catch (error) {
    throw new Error(
      `Could not use system variable ${rawToken}:\n${error.stack}`,
    )
  }
}

const replaceToken = function (title, { name, value = '' }) {
  return title.replace(name, value)
}
