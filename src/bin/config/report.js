/* eslint-disable max-lines */
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
info, context, link.
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
  limit: {
    group: REPORT,
    alias: 'l',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Report when the average duration has increased by more than a
specific percentage such as "50%".
The limit can be scoped to specific combinations by appending their identifiers
after the percentage. The syntax is the same as the "include" configuration
property. For example "50% taskOne node" applies only to taskOne when the
runner is node.
Several limits can be specified at once.`,
  },
  colors: {
    group: REPORT,
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive.`,
  },
  info: {
    group: REPORT,
    boolean: true,
    describe: `Show hardware and software information.
Default: false`,
  },
  context: {
    group: REPORT,
    boolean: true,
    describe: `Show context information such as id, timestamp, commit/branch
or CI build.
Default: true for command "show", false otherwise`,
  },
  showDiff: {
    group: REPORT,
    boolean: true,
    describe: `Show the difference with previous results.
Default: true if the terminal is interactive.`,
  },
  link: {
    group: REPORT,
    boolean: true,
    describe: `Show link to the library's main page.
Default: true`,
  },
  since: {
    group: REPORT,
  },
  compare: {
    group: REPORT,
    describe: `Which result to compare to when using the "limit" or "showDiff"
configuration properties.
Can be:
  - integer: compare with the {integer}-th previous result
  - a date|time: compare with the last result before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-ddThh:mm:ssZ'.
Default: 1`,
  },
}
/* eslint-enable max-lines */
