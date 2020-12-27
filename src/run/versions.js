import execa from 'execa'

import { PluginError } from '../error/main.js'

// Runtime versions for this runner, returned as `versions` from
// `runner.launch()`
// Used by the `--info` configuration property
export const getVersionValue = async function (value, runnerId) {
  if (typeof value === 'string') {
    return value
  }

  const [file, ...args] = value

  try {
    const { stdout } = await execa(file, args, { preferLocal: true })
    return stdout
  } catch (error) {
    throw new PluginError(
      `Could not start runner '${runnerId}'\n\n${error.shortMessage}`,
    )
  }
}
