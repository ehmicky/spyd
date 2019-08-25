import { platform, env } from 'process'

import osName from 'os-name'

// The `system` option can contain some `$VAR` that are substituted:
//  - environment variables
//  - $OS, $OS_FULL
//  - runner-specific variables like $NODE_MAJOR_VERSION
export const replaceSystemVars = async function(title) {
  const tokens = [...title.matchAll(SYSTEM_VAR_REGEXP)]

  if (tokens === null) {
    return title
  }

  const tokensA = await Promise.all(tokens.map(getToken))
  const titleA = tokensA.reduce(replaceToken, title)
  return titleA
}

const SYSTEM_VAR_REGEXP = /\{\{(\w+)\}\}/gu

const getToken = async function([name, varName]) {
  const value = await getTokenValue(varName, name)
  return { name, value }
}

const getTokenValue = async function(varName, name) {
  const getValue = SYSTEM_VARS[varName]

  if (getValue === undefined) {
    return env[varName]
  }

  try {
    return await getValue()
  } catch (error) {
    throw new Error(`Could not use system variable ${name}:\n${error.stack}`)
  }
}

const SYSTEM_VARS = {
  OS() {
    return OS[platform]
  },
  OS_FULL() {
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

const replaceToken = function(title, { name, value = '' }) {
  return title.replace(name, value)
}
