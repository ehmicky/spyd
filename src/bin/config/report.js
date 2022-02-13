import { REPORT, HISTORY } from './groups.js'

// Configuration shared by commands that report results: `run`, `show`, `remove`
export const REPORT_CONFIG = {
  reporter: {
    group: REPORT,
    describe: `Reporter-related configuration.
Can be empty, if no reporters should be used.
Can be specified several times to use several reporters, or the same reporter
with different configurations.`,
  },
  'reporter.id': {
    group: REPORT,
    alias: 'r',
    requiresArg: true,
    describe: `Module to report the result.
When using multiple reporters, this can be "any" to apply some configuration to
all other reporters.
Built-in reporters: "debug", "histogram", "boxplot", "history"
Custom reporters can also be installed from npm.
Default: "debug"`,
  },
  'reporter.output': {
    group: REPORT,
    alias: 'o',
    requiresArg: true,
    describe: `Output the result to "stdout" or to a file path.

Instead of overwriting the file, the result can be inserted between two lines
with the words "spyd-start" and "spyd-end" such as <!-- spyd-start --> or
#spyd-start
Otherwise, the file is overwritten.

The default value depends on the reporter`,
  },
  'reporter.colors': {
    group: REPORT,
    describe: `Use colors in output.
Default: true if the output is an interactive terminal.`,
  },
  'reporter.showTitles': {
    group: REPORT,
    describe: `Show titles instead of identifiers.
Default: false`,
  },
  'reporter.showSystem': {
    group: REPORT,
    describe: `Show hardware and software information.
Default: true when the result has a "system", false otherwise`,
  },
  'reporter.showMetadata': {
    group: REPORT,
    describe: `Show metadata such as id, timestamp, commit/branch or CI build.
Default: true for command "show" and "remove", false otherwise`,
  },
  'reporter.showPrecision': {
    group: REPORT,
    describe: `Show the results confidence interval.
Default: false.`,
  },
  'reporter.showDiff': {
    group: HISTORY,
    describe: `Show the difference with previous results.
Default: true if the output is an interactive terminal.`,
  },
  titles: {
    group: REPORT,
    requiresArg: true,
    describe: `Rename some identifiers in reports.
Uses a dot notation such as --titles.id=string
The id can be any identifier: task, runner, system, variation.`,
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
