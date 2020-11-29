import { platform, env } from 'process'

import osName from 'os-name'
import slugify from 'slugify'

import { PluginError } from '../error/main.js'

// The `system` configuration property can contain some `$VAR` that are
// substituted:
//  - environment variables
//  - {{os}}, {{os_full}}
//  - runner-specific variables like {{node_major}}
export const normalizeSystem = function ({ system, run, ...config }) {
  const title = getTitle(system, run)
  const id = slugify(title, { lower: true, remove: INVALID_ID_REGEXP })
  return { ...config, run, system: { id, title } }
}

const getTitle = function (system, run) {
  const systemVars = getSystemVars(run)
  const title = system
    .replace(SYSTEM_VAR_REGEXP, replaceToken.bind(undefined, systemVars))
    .trim()
  return title
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

const SYSTEM_VAR_REGEXP = /\{\{(\w+)\}\}/gu

const replaceToken = function (systemVars, fullName, name) {
  if (systemVars[name] !== undefined) {
    return getSystemValue(systemVars[name], fullName)
  }

  if (env[name]) {
    return env[name]
  }

  return ''
}

const getSystemValue = function (getValue, fullName) {
  try {
    return getValue()
  } catch (error) {
    throw new PluginError(
      `Could not use system variable ${fullName}\n${error.stack}`,
    )
  }
}

const INVALID_ID_REGEXP = /[^\w. -]/gu
