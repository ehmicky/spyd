/* eslint-disable max-lines */
import { REPORT } from './groups.js'

// Configuration shared by reporting commands: `bench`, `show`
export const REPORT_CONFIG = {
  reporters: {
    group: REPORT,
    alias: 'R',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Modules to report the result.
Built-in reporters: silent.
Custom reporters can also be installed from npm.`,
  },
  reporter: {
    group: REPORT,
    describe: `Reporter-specific configuration properties.
Uses a dot notation such as --report.json.output=path
The following properties can be set for any reporter: output, insert, colors,
info, context, link.
For example --report.json.output is like --output but only for the json reporter.`,
  },
  titles: {
    group: REPORT,
    requiresArg: true,
    describe: `Rename some identifiers in reports.
Uses a dot notation such as --titles.id=string
The id can be any identifier: task, runner, system, input, property set.`,
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
To target a specific task, input, system or runner, append its id, for example
"50% taskId" or "50% taskId inputId". Can be specified several times`,
  },
  colors: {
    group: REPORT,
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive`,
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
  link: {
    group: REPORT,
    boolean: true,
    describe: `Show link to the library's main page.
Default: true`,
  },
  since: {
    group: REPORT,
  },
  diff: {
    group: REPORT,
    describe: `Compare the difference with a previous result.
Can be:
  - false: do not compare
  - true: compare with the last result
  - integer: compare with the {integer}-th previous result
  - a date|time: compare with the last result before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-ddThh:mm:ssZ'.
Default: true`,
  },
}
/* eslint-enable max-lines */
