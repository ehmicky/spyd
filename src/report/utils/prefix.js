import { blue } from 'chalk'

// Add a title as prefix for terminal reporters
export const addPrefix = function (name, value) {
  if (value === undefined || value === '') {
    return
  }

  return `${blue.bold(`${name}:`)} ${value}`
}
