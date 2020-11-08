// Configuration shared by reporting commands: `run`, `show`
export const REPORT_CONFIG = {
  report: {
    describe: `Module to report benchmarks.
Built-in reporters: silent.
Custom reporters can also be installed from npm.
Uses a dot notation such as --report.json (not --report=json nor --report json).
Reporter-specific options can be specified using the same dot notation.
The following options can be set for any reporter: output, insert, colors, info,
context, link.
For example --report.json.output is like --output but only for the json reporter.`,
  },
  output: {
    alias: 'o',
    string: true,
    requiresArg: true,
    describe: `Output the benchmarks to the specified file.
For silent output, use "". This is the default if --insert is used.
To print to stdout, use "-". This is the default otherwise.`,
  },
  insert: {
    string: true,
    requiresArg: true,
    describe: `Insert the benchmarks inside the specified file.
The file must contain:
  - a line with the words "spyd-start" such as <!-- spyd-start --> or #spyd-start
  - a line with the words "spyd-end"
The benchmarks will be inserted between those two lines.`,
  },
  limit: {
    alias: 'l',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Report when the average duration has increased by more than a
specific percentage such as "50%".
To target a specific task, input, system or runner, prefix its id, for example
"taskId:50%" or "taskId,inputId:50%". Can be specified several times`,
  },
  colors: {
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive`,
  },
  info: {
    boolean: true,
    describe: `Show hardware and software information.
Default: false`,
  },
  context: {
    boolean: true,
    describe: `Show context information such as id, timestamp, commit/branch
or CI build.
Default: true for command "show", false otherwise`,
  },
  link: {
    boolean: true,
    describe: `Show link to the library's main page.
Default: true`,
  },
  diff: {
    describe: `Compare the difference with a previous benchmark.
Can be:
  - false: do not compare
  - true: compare with the last benchmark
  - integer: compare with the {integer}-th previous benchmark
  - a date|time: compare with the last benchmark before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-ddThh:mm:ssZ'.
Default: true`,
  },
}
