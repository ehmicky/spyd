import { CONFIG } from './groups.js'

// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    group: CONFIG,
    alias: 'c',
    describe: `Configuration file location.

This can be:
  - A file path
  - A Node module name starting with "spyd-config-", optionally prefixed with
    any npm "@scope/"

By default, any "spyd.*" file in the current or parent directories is used.
It can also be inside a "benchmark" or "packages/spyd-config-*" sub-directory.
This can disabled by setting an empty value.

The following file formats are supported: .yml, .js, .mjs or .cjs

Can be specified several times.
A configuration file can include another one by using this property.
This can be used to share configurations and/or benchmarks.

If you want to merge a specific property of a configuration file instead, any
configuration property can be a "config##path" string:
  - "config" is the file path or Node module name of the configuration file.
    The syntax is the same as described above.
  - "path" is the property dot-delimited path

You can define selectors, i.e. different values per combination for some
configuration properties ("limit", "outliers", "precision", "showDiff",
"showPrecision", "showTitles").
The configuration property must then be an object where:
  - The key selects the combinations, using the same syntax as the "select"
    configuration property. The last key must be "default" and is used as a
    fallback when no other key matches.
  - The value is the configuration value to apply for those combinations.

You can also define variations, i.e. separate combinations for multiple values of
some configuration properties ("inputs", "runner.*").
The configuration property must then be an object where:
  - The key is any identifier for that variation
  - The value is the configuration value to apply

The syntax of those two features is similar but:
  - Selectors pick existing combinations and apply separate configuration values
    to them
  - While variations run new combinations for each possible value of a
    configuration property`,
  },
  cwd: {
    group: CONFIG,
    requiresArg: true,
    describe: `Customize the current directory used:
  - In task files
  - When looking for the current git commit and branch
This is not used to resolve configuration properties that are file paths.`,
  },
}
