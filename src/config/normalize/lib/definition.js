export const normalizeDefinition = function ({
  name,
  pick,
  condition,
  default: defaultValue,
  compute,
  path = false,
  glob = false,
  required = false,
  example,
  validate,
  transform,
  rename,
}) {
  return {
    name,
    pick,
    condition,
    default: defaultValue,
    compute,
    path,
    glob,
    required,
    example,
    validate,
    transform,
    rename,
  }
}
