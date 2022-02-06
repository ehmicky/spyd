import { addPlugins } from './lib/main.js'

// Handle the configuration all spyd-specific plugins: reporters and runners
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  configInfos,
}) {
  return await addPlugins({
    config,
    command,
    context,
    configInfos,
  })
}
