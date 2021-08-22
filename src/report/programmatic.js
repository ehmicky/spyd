// The `run`, `show` and `remove` commands return the result programmatically.
// We add an internal programmatic reporter to get this result.
// We use a reporter so that:
//  - The final result has the same fields as the one passed to reporters since:
//     - It has all the information users might need
//     - This avoids documenting two separate objects
//  - This is not coupled with any specific user reporter
// We purposely return the `result` and not any reporter's `content`
// programmatically
//  - The `content` is fit for reporting only, not programmatic usage
//  - It can still be accessed by outputting it a specific file then read that
//    file separately
// The programmatic reporter's configuration ensures:
//  - All properties users might want are available
//  - Properties very specific to reporting such as `footer` are not returned
//  - Internal properties like `debugStats` are not returned
export const addProgrammaticReporter = function (reporters) {
  return [PROGRAMMATIC_REPORTER, ...reporters]
}

const PROGRAMMATIC_REPORTER = {
  format: 'programmatic',
  tty: false,
  debugStats: false,
  config: {
    quiet: true,
    output: 'programmatic',
    showSystem: true,
    showMetadata: true,
    showTitles: true,
    showPrecision: true,
    showDiff: true,
    colors: false,
  },
}