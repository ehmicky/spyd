import { REPORT, HISTORY } from './groups.js'

// Configuration shared by commands that report results: `run`, `show`, `remove`
export const REPORT_CONFIG = {
  reporter: {
    group: REPORT,
    alias: 'r',
    describe: `Modules to report the result.

Can be empty, if no reporters should be used.
Can be specified several times. The same reporter can be used several times but
with different configurations.

This is an object with:
  - An "id" property with the reporter's id, such as "histogram"
  - Any configuration property passed to that reporter, such as "mini: true"
  - The "quiet", "output", "colors", "showTitles", "showSystem", "showMetadata",
    "showPrecision" and "showDiff" configuration properties can be specified to
    apply them only to that reporter

A string can be used instead as a shortcut if the object has a single "id"
property.

Built-in reporters: "debug", "histogram", "boxplot", "history"
Custom reporters can also be installed from npm.
Default: "debug"`,
  },
  output: {
    group: REPORT,
    alias: 'o',
    requiresArg: true,
    string: true,
    describe: `Output the result to "stdout" or to a file path.

Instead of overwriting the file, the result can be inserted between two lines
with the words "spyd-start" and "spyd-end" such as <!-- spyd-start --> or
#spyd-start
Otherwise, the file is overwritten.

The default value depends on the reporter`,
  },
  colors: {
    group: REPORT,
    boolean: true,
    describe: `Use colors in output.
Default: true if the output is an interactive terminal.`,
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
Default: true when the result has a "system", false otherwise`,
  },
  showMetadata: {
    group: REPORT,
    boolean: true,
    describe: `Show metadata such as id, timestamp, commit/branch or CI build.
Default: true for command "show" and "remove", false otherwise`,
  },
  showPrecision: {
    group: REPORT,
    boolean: true,
    describe: `Show the results confidence interval.
Default: false.`,
  },
  showDiff: {
    group: HISTORY,
    boolean: true,
    describe: `Show the difference with previous results.
Default: true if the output is an interactive terminal.`,
  },
  limit: {
    group: HISTORY,
    alias: 'l',
    requiresArg: true,
    describe: `Report when the average duration has increased by more than a
specific percentage.

For example, "50" reports any increase of at least 50%.
Negative numbers like "-50" can be used for decreases instead.
"0" can be used to report any increase.

Default: none`,
  },
}
