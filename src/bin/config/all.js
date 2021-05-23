import { CONFIG } from './groups.js'

// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    group: CONFIG,
    alias: 'c',
    array: true,
    string: true,
    requiresArg: true,
    describe: `Location or name of the configuration file.

This can be:
  - "default": "spyd.*" or "benchmark/spyd.*" in the current or any parent
    directory.
  - A file path
  - A Node module prefixed with "npm:". For example, "npm:example" looks for any
    "spyd-config-example" Node module exporting a spyd configuration file.

The following file formats are supported: .yml, .js, .cjs, .ts

Can be specified several times.
A configuration file can include another one by using this property.
This can be used to share configurations and/or benchmarks.`,
  },
  cwd: {
    group: CONFIG,
    string: true,
    requiresArg: true,
    describe: `Current directory when:
  - Running tasks
  - Looking for the current git commit and branch
This is not used to resolve configuration properties that are file paths.
Default: current directory`,
  },
  debug: {
    group: CONFIG,
    boolean: true,
  },
}
