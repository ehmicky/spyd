import { REPORT } from './groups.js'

// Configuration shared by reporting commands: `bench`, `show`, `remove`
export const REPORT_CONFIG = {
  reporter: {
    group: REPORT,
    alias: 'r',
    string: true,
    array: true,
    describe: `Modules to report the result.
Can be specified several times.
Can be empty, if no reporters should be used.
Built-in reporters: histogram
Custom reporters can also be installed from npm.
Reporter-specific configuration properties can be specified by appending the
reporter's name: --reportName.prop=value.
For example: --reportJson.output=path
The following properties can be set for any reporter: output, colors,
showSystem, showMetadata.
For example --reportJson.output is like --output but only for the json reporter.`,
  },
  output: {
    group: REPORT,
    alias: 'o',
    string: true,
    requiresArg: true,
    describe: `Output the result to the specified file.
Instead of overwriting the file, the result can be inserted between two lines
with the words "spyd-start" and "spyd-end" such as <!-- spyd-start --> or
#spyd-start
By default, the file is overwritten.
Default: print to stdout.`,
  },
  colors: {
    group: REPORT,
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive.`,
  },
  titles: {
    group: REPORT,
    requiresArg: true,
    describe: `Rename some identifiers in reports.
Uses a dot notation such as --titles.id=string
The id can be any identifier: task, runner, system, variation.`,
  },
  showTitles: {
    group: REPORT,
    boolean: true,
    describe: `Show titles instead of identifiers.
Default: false`,
  },
  showSystem: {
    group: REPORT,
    boolean: true,
    describe: `Show hardware and software information.
Default: true when the "system" configuration property is set, false otherwise`,
  },
  showMetadata: {
    group: REPORT,
    boolean: true,
    describe: `Show metadata such as id, timestamp, commit/branch or CI build.
Default: true for command "show" and "remove", false otherwise`,
  },
  showDiff: {
    group: REPORT,
    boolean: true,
    describe: `Show the difference with previous results.
Default: true if the terminal is interactive.`,
  },
}
