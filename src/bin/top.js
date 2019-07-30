import yargs from 'yargs'

export const defineCli = function() {
  return yargs
    .options(CONFIG)
    .usage(USAGE)
    .example(MAIN_EXAMPLE, 'Run benchmarks')
    .example(LONG_EXAMPLE, 'Run benchmarks for 60 seconds')
    .help()
    .version()
    .strict()
}

const CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `Configuration file.
Default: "check_speed.json" in the current directory or any parent directory`,
  },
  duration: {
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to benchmark each task.
Default: 10`,
  },
  cwd: {
    string: true,
    requiresArg: true,
    describe: 'Current directory',
  },
}

const USAGE = `$0 [OPTIONS] [FILE]

Benchmark the tasks defined in FILE.

FILE defaults to "benchmarks.js|ts", "benchmarks/index.js|ts" or "benchmarks/main.js|ts".`

const MAIN_EXAMPLE = '$0'
const LONG_EXAMPLE = '$0 -d 60'
