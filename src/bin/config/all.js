import { CONFIG } from './groups.js'

// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    group: CONFIG,
    alias: 'c',
    string: true,
    describe: `Configuration file location.

This can be:
  - A file path
  - A Node module exporting a configuration file.
    The module name must start with "spyd-config-".

By default, any "spyd.*" file in the current or parent directories is used.
It can also be inside a "benchmark" or "packages/spyd-config-*" sub-directory.
This can disabled by setting an empty value.

The following file formats are supported: .yml, .js, .mjs or .cjs

Can be specified several times.
A configuration file can include another one by using this property.
This can be used to share configurations and/or benchmarks.

You can define different values per combination for some configuration
properties ("limit", "outliers", "precision", "showDiff", "showPrecision",
"showTitles").
The configuration property must then be an object where:
  - The key selects the combinations, using the same syntax as the "select"
    configuration property. The last key must be "default" and is used as a
    fallback when no other key matches.
  - The value is the configuration value to apply for those combinations.`,
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
}
