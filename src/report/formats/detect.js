import { FORMATS } from './list.js'

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
export const computeFormat = function ({ config: { output } }) {
  const { name: format } = Object.values(FORMATS).find(({ detect }) =>
    detect(output),
  )
  return format
}

// Validate that a reporter supports the format specified by a given `output`
export const validateFormat = function (
  format,
  {
    config: { output },
    context: {
      plugin,
      plugin: { id },
    },
  },
) {
  const hasMethod = FORMATS[format].methods.some(
    (method) => plugin[method] !== undefined,
  )

  if (!hasMethod) {
    throw new Error(
      `must not use unsupported "output: ${output}" with reporter "${id}".`,
    )
  }
}
