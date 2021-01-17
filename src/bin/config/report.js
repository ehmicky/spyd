import { REPORT } from './groups.js'

// Configuration shared by reporting commands: `bench`, `show`
export const REPORT_CONFIG = {
  reporter: {
    group: REPORT,
    alias: 'R',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Modules to report the result.
Built-in reporters: silent.
Custom reporters can also be installed from npm.
Reporter-specific configuration properties can be specified by appending the
reporter's name: --reportName.prop=value.
For example: --reportJson.output=path
The following properties can be set for any reporter: output, insert, colors,
showSystem, showMetadata.
For example --reportJson.output is like --output but only for the json reporter.`,
  },
  titles: {
    group: REPORT,
    requiresArg: true,
    describe: `Rename some identifiers in reports.
Uses a dot notation such as --titles.id=string
The id can be any identifier: task, runner, system, variation.`,
  },
  output: {
    group: REPORT,
    alias: 'o',
    string: true,
    requiresArg: true,
    describe: `Output the result to the specified file.
For silent output, use "". This is the default if --insert is used.
To print to stdout, use "-". This is the default otherwise.`,
  },
  insert: {
    group: REPORT,
    alias: 'i',
    string: true,
    requiresArg: true,
    describe: `Insert the result inside the specified file.
The file must contain:
  - a line with the words "spyd-start" such as <!-- spyd-start --> or #spyd-start
  - a line with the words "spyd-end"
The result will be inserted between those two lines.`,
  },
  colors: {
    group: REPORT,
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive.`,
  },
  showSystem: {
    group: REPORT,
    boolean: true,
    describe: `Show hardware and software information.
Default: false`,
  },
  showMetadata: {
    group: REPORT,
    boolean: true,
    describe: `Show metadata such as id, timestamp, commit/branch or CI build.
Default: true for command "show", false otherwise`,
  },
  showDiff: {
    group: REPORT,
    boolean: true,
    describe: `Show the difference with previous results.
Default: true if the terminal is interactive.`,
  },
  since: {
    group: REPORT,
  },
}
