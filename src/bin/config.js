// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `JSON configuration file.
Can specify the same options as the CLI flags.
Environment variables can also be used, prefixed with "SPYD_". For example
SPYD_JOB=same is like --job same and SPYD_RUN_NODE_VERSIONS 8 is like
--run.node.versions 8.
Default: "spyd.json" in the current directory or any parent directory`,
  },
  cwd: {
    string: true,
    requiresArg: true,
    describe: `Current directory.
Used to find the default configuration and tasks files.`,
  },
  store: {
    describe: `Module to save benchmarks.
Built-in stores: file.
Custom stores (installed with npm) can also be used.
Uses a dot notation such as --store.file (not --store=file nor --store file).
Store-specific options can be specified using the same dot notation such as
--store.file.dir`,
  },
}

// Configuration shared by reporting commands: `run` and `show`
export const REPORT_CONFIG = {
  report: {
    describe: `Module to report benchmarks.
Built-in reporters: silent.
Custom reporters (installed with npm) can also be used.
Uses a dot notation such as --report.json (not --report=json nor --report json).
Reporter-specific options can be specified using the same dot notation.
The following options can be set for any reporter: output, insert, colors,
system, link.
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
  colors: {
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive`,
  },
  system: {
    boolean: true,
    describe: `Show hardware and software information.
Default: false`,
  },
  verbose: {
    boolean: true,
    describe: `Show advanced statistics.
Default: false`,
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
