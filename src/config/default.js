import { cleanObject } from '../utils/clean.js'

// Add default configuration properties
export const addDefaultConfig = function (config) {
  return cleanObject(config)
}
