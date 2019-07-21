import yargs from 'yargs'

export const defineCli = function() {
  return yargs
    .options(CONFIG)
    .usage(USAGE)
    .example(MAIN_EXAMPLE, 'Run benchmarks')
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
  repeat: {
    alias: 'r',
    number: true,
    requiresArg: true,
    describe: `Number of times to repeat each task.
Default: 1000`,
  },
  concurrency: {
    number: true,
    requiresArg: true,
    describe: `Maximum number of iterations to run in parallel.
Default: 100`,
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
