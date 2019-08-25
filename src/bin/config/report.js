// Configuration shared by reporting commands: `run`, `show`
export const REPORT_CONFIG = {
  report: {
    describe: `Module to report benchmarks.
Built-in reporters: silent.
Custom reporters (installed with npm) can also be used.
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
    describe: `Overwrite the specified file with the benchmarks.
Can be "" for silent output.
Can be "-" to print to stdout.
Default: "" if --insert is used, "-" otherwise.`,
  },
  insert: {
    alias: 'i',
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
specific percentage.
Can be specified several times.
The value is the percentage (e.g. "50" for 50%).
It can prefixed by a comma-separated list of identifiers (tasks, variations,
runners or systems) to target.`,
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
    describe: `Show context information such as timestamp, group, commit/branch
or CI build.`,
  },
  link: {
    boolean: true,
    describe: `Show link to the library's main page.
Default: true`,
  },
  diff: {
    describe: `Compare difference with a previous benchmark.
Can be false, true, integer or timestamp (like the 'show' option).
Default: true`,
  },
}
