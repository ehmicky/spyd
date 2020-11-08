import { platform, env } from 'process'

import osName from 'os-name'

// The `system` option can contain some `$VAR` that are substituted:
//  - environment variables
//  - {{os}}, {{os_full}}
//  - runner-specific variables like {{node_major}}
export const replaceSystemVars = function (title, run) {
  // TODO: use String.matchAll after dropping support for Node <12
  const rawTokens = title.match(SYSTEM_VAR_REGEXP)

  if (rawTokens === null) {
    return title
  }

  const systemVars = getSystemVars(run)
  const titleA = rawTokens
    .map((rawToken) => getToken(rawToken, systemVars))
    .reduce(replaceToken, title)
  return titleA
}

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

const getToken = function (rawToken, systemVars) {
  const name = rawToken.replace(SYSTEM_VAR_REGEXP, '$1')
  const value = getTokenValue({ name, rawToken, systemVars })
  return { name, value }
}

const SYSTEM_VAR_REGEXP = /\{\{(\w+)\}\}/gu

const getTokenValue = function ({ name, rawToken, systemVars }) {
  const getValue = systemVars[name]

  if (getValue === undefined) {
    return env[name]
  }

  try {
    return getValue()
  } catch (error) {
    throw new Error(
      `Could not use system variable ${rawToken}:\n${error.stack}`,
    )
  }
}

const replaceToken = function (title, { name, value = '' }) {
  return title.replace(name, value)
}
