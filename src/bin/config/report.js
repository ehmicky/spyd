/* eslint-disable max-lines */
import { REPORT, HISTORY } from './groups.js'

// Configuration shared by reporting commands: `run`, `show`, `remove`
export const REPORT_CONFIG = {
  reporter: {
    group: REPORT,
    alias: 'r',
    string: true,
    describe: `Modules to report the result.

Can be empty, if no reporters should be used.
Can be specified several times.
To use the same reporter several times but with different configurations, append
an underscore followed by any characters to the identifier.
For example: --reporter=debug_tty --runner=debug_ci

Built-in reporters: histogram
Custom reporters can also be installed from npm.
Default: "debug"`,
  },
  reporterConfig: {
    group: REPORT,
    describe: `Reporters' configuration.
Each reporter has its own configuration namespaced by its identifier.
For example: --reporterConfig.json.output=8

The following configuration properties can be set for any reporter: quiet,
output, colors, showTitles, showSystem, showMetadata, showPrecision, showDiff.
For example --reporterConfig.json.output is like --output but only for the json
reporter.`,
  },
  output: {
    group: REPORT,
    alias: 'o',
    string: true,
    requiresArg: true,
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
Default: true when the "system" configuration property is set, false otherwise`,
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
  // We do not use `number: true` to avoid parsing invalid numbers as NaN
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
/* eslint-enable max-lines */
