// Validate plugins shape
export const validatePlugins = function (plugins, type) {
  plugins.forEach((plugin) => {
    validatePlugin(plugin, type)
  })
}

const validatePlugin = function ({ id }, type) {}
