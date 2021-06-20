import { CONFIG } from './groups.js'

// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    group: CONFIG,
    alias: 'c',
    array: true,
    string: true,
    requiresArg: true,
    describe: `Configuration file location.

This can be:
  - "default": any "spyd.*" file in the current or parent directories.
    Can be inside a "benchmark" or "packages/spyd-config-*" sub-directory.
  - A file path
  - A Node module exporting a configuration file.
    The module name must start with "spyd-config-".

The following file formats are supported: .yml, .js, .mjs or .cjs

Can be specified several times.
A configuration file can include another one by using this property.
This can be used to share configurations and/or benchmarks.`,
  },
  cwd: {
    group: CONFIG,
    string: true,
    requiresArg: true,
    describe: `Customize the current directory used:
  - In task files
  - When looking for the current git commit and branch
This is not used to resolve configuration properties that are file paths.`,
  },
  debug: {
    group: CONFIG,
    boolean: true,
  },
}
