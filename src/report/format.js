import { UserError } from '../error/main.js'

// Retrieve the reporter's format, based on its `output`
export const getFormat = function (output) {
  return Object.entries(FORMATS).find(([, { detect }]) => detect(output))[0]
}

// Format meant for reporters without return value.
// For example: separate programs, network requests, desktop notifications
const EXTERNAL_FORMAT = {
  detect(output) {
    return output === 'external'
  },
  async report({ reportExternal, id, config }, reporterArgs) {
    assertFormat(reportExternal !== undefined, id, config)
    await reportExternal(...reporterArgs)
  },
}

// Format meant for string output which should be output to a terminal or to
// a file.
// Used as the fallback format.
const TERMINAL_FORMAT = {
  detect() {
    return true
  },
  async report({ reportTerminal, id, config }, reporterArgs) {
    assertFormat(reportTerminal !== undefined, id, config)
    return await reportTerminal(...reporterArgs)
  },
}

const assertFormat = function (condition, id, { output }) {
  if (!condition) {
    throw new UserError(
      `The reporter "${id}" does not support "output": "${output}"`,
    )
  }
}

// Order is significant
export const FORMATS = { external: EXTERNAL_FORMAT, terminal: TERMINAL_FORMAT }
