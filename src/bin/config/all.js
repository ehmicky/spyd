import { CONFIG } from './groups.js'

// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    group: CONFIG,
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `Path to the configuration file.
Default: "benchmark/spyd.{yml,js,cjs,ts}" in the current or any parent
directory.`,
  },
  extend: {
    group: CONFIG,
    string: true,
    requiresArg: true,
    describe: `Path to a configuration file to extend from.
This can either a file path or a Node module.
As opposed to "config", this is used to share configuration between projects.`,
  },
  cwd: {
    group: CONFIG,
    string: true,
    requiresArg: true,
    describe: `Current directory when running tasks.
This is also used when:
  - Looking for the default "config" file
  - Resolving CLI flags that are file paths
  - Looking for the current git commit and branch
Default: current directory`,
  },
  debug: {
    group: CONFIG,
    boolean: true,
  },
}
