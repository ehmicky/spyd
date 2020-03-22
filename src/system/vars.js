import { platform, env } from 'process'

import osName from 'os-name'

// The `system` option can contain some `$VAR` that are substituted:
//  - environment variables
//  - <<OS>>, <<OS_FULL>>
//  - runner-specific variables like <<NODE_MAJOR_VERSION>>
export const replaceSystemVars = async function (title, run) {
  const tokens = [...title.matchAll(SYSTEM_VAR_REGEXP)]

  if (tokens === null) {
    return title
  }

  const systemVars = getSystemVars(run)
  const tokensA = await Promise.all(
    tokens.map(([name, varName]) => getToken({ name, varName, systemVars })),
  )
  const titleA = tokensA.reduce(replaceToken, title)
  return titleA
}

const SYSTEM_VAR_REGEXP = /<<(\w+)>>/gu

// Retrieve all available variables
const getSystemVars = function (run) {
  const runSystemVars = Object.assign({}, ...run.map(({ system }) => system))
  return { ...runSystemVars, ...SYSTEM_VARS }
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

const getToken = async function ({ name, varName, systemVars }) {
  const value = await getTokenValue({ name, varName, systemVars })
  return { name, value }
}

const getTokenValue = async function ({ name, varName, systemVars }) {
  const getValue = systemVars[varName]

  if (getValue === undefined) {
    return env[varName]
  }

  try {
    return await getValue()
  } catch (error) {
    throw new Error(`Could not use system variable ${name}:\n${error.stack}`)
  }
}

const replaceToken = function (title, { name, value = '' }) {
  return title.replace(name, value)
}
