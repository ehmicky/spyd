import yargs from 'yargs'

export const defineCli = function() {
  return yargs
    .options(CONFIG)
    .usage(USAGE)
    .example(MAIN_EXAMPLE, 'Run benchmarks')
    .example(LONG_EXAMPLE, 'Benchmark each task for 60 seconds')
    .help()
    .version()
    .strict()
}

const CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `JSON configuration file.
Can specify the same options as the CLI flags.
Default: "spyd.json" in the current directory or any parent directory`,
  },
  cwd: {
    string: true,
    requiresArg: true,
    describe: `Current directory.
Used to find the default configuration and tasks files.`,
  },
  duration: {
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to benchmark each task.
Default: 10`,
  },
  require: {
    alias: 'r',
    string: true,
    array: true,
    requiresArg: true,
    describe: 'Module to load before the task file.',
  },
}

const USAGE = `$0 [OPTIONS] [FILE]

Benchmark JavaScript code.

FILE defaults to "./benchmarks.js|ts" or "./benchmarks/main.js|ts".

FILE must export the tasks to benchmark. Each task must be either:
  - a function
  - an object with any of the following properties

Task properties:
  main()      Function being benchmarked.
              Can be async.

  before()    Function fired before each main(). Not benchmarked.
              Can be async.
              Its return value is passed as argument to main() and after().
              If the return value is not modified by main(), using a top-level
              variable instead of before() is preferred.

  after()     Function fired after each main(). Not benchmarked.
              Can be async.

  title       Title shown by reporters.
              Defaults to the task variable name.                       [string]

  parameters  Each value of that object is passed to main(), before(), after().
              Separate benchmarks for each value are created.
              The keys are the parameters titles shown by reporters.    [object]`

const MAIN_EXAMPLE = '$0'
const LONG_EXAMPLE = '$0 -d 60'
