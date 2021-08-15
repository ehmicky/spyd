import { UserError } from '../error/main.js'

// Retrieve the reporter's format, based on its `output`.
// Reporters can specify different formats by exporting one method for each
// format, for example `reportTerminal()` for the terminal format.
// Some formats default to re-using another format when their `report*()` method
// is absent from a specific reporter. This simplifies reporters.
// We use formats to differentiate between a reporter's intent
// (debug, histogram, etc.) and the output format:
//  - This leads to a smaller list of reporters
//  - This allows knowing in advance which format is supported by a specific
//    reporter
// Reporters use one method per format as opposed to alternatives like:
//  - A single `report()` method returning all formats at once because this
//    would compute unused formats.
//  - A format passed as argument to `report()` because this does not allow
//    knowing in advance which formats are supported.
//  - Using different modules for each format, for example
//    `spyd-reporter-{reporter}-{format}` because this:
//     - Requires uninstalling/installing to change format
//     - Is harder for publisher
export const getFormat = function (reporter, output) {
  const [format] = Object.entries(FORMATS).find(([, { detect }]) =>
    detect(output),
  )
  validateFormat({ format, reporter, output })
  return format
}

// Validate that a reporter supports the format specified by a given `output`
const validateFormat = function ({
  format,
  reporter,
  reporter: { id },
  output,
}) {
  const hasMethod = FORMATS[format].methods.some(
    (method) => reporter[method] !== undefined,
  )

  if (!hasMethod) {
    throw new UserError(
      `The reporter "${id}" does not support "output": "${output}"`,
    )
  }
}

// Format meant for reporters without any return value.
// For example: separate programs, network requests, desktop notifications
const EXTERNAL_FORMAT = {
  // Return whether this format should be used, for a given output
  detect(output) {
    return output === 'external'
  },
  // At least one of the following reporter methods must exist to use this
  // format
  methods: ['reportExternal'],
  // Call the reporter's methods and possibly return or manipulate its return
  // value
  async report({ reportExternal }, reporterArgs) {
    await reportExternal(...reporterArgs)
  },
  // Whether it is possible to use two reporters with this format and with the
  // same `output` but with possibly different configurations
  concat: false,
  // Whether top/bottom/left/right padding should be added
  padding: false,
}

// Format meant for string output which should be output to a terminal or to
// a file.
// Used as the fallback format.
const TERMINAL_FORMAT = {
  detect() {
    return true
  },
  methods: ['reportTerminal'],
  async report({ reportTerminal }, reporterArgs) {
    return await reportTerminal(...reporterArgs)
  },
  concat: true,
  padding: true,
}

// Order is significant
export const FORMATS = { external: EXTERNAL_FORMAT, terminal: TERMINAL_FORMAT }
