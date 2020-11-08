import { blue, underline } from 'chalk'

import { isEmptyObject } from '../utils/main.js'

// Serialize `ci` information for CLI reporters.
export const prettifyCi = function (ci) {
  if (ci === undefined || isEmptyObject(ci)) {
    return ''
  }

  const header = blue.bold('CI:')
  const providerPretty = prettifyProvider(ci)
  const buildPretty = prettifyBuild(ci)
  const body = [providerPretty, buildPretty].filter(Boolean).join('\n')
  return `${header}\n${body}`
}

const prettifyProvider = function ({ provider }) {
  if (provider === undefined) {
    return
  }

  const field = blue.bold('  Provider: ')
  return `${field}${provider}`
}

const prettifyBuild = function ({ buildNumber, buildUrl }) {
  if (buildNumber === undefined) {
    return
  }

  const field = blue.bold('  Build: ')
  const urlA = getUrl(buildUrl)
  return `${field}#${buildNumber}${urlA}`
}

const getUrl = function (url) {
  if (url === undefined) {
    return ''
  }

  return ` (${underline(url)})`
}
