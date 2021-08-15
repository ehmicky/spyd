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
}

// Format meant for string output which should be output to a terminal or to
// a file.
// Used as the fallback format.
const TERMINAL_FORMAT = {
  detect() {
    return true
  },
}

// Order is significant
const FORMATS = { external: EXTERNAL_FORMAT, terminal: TERMINAL_FORMAT }
