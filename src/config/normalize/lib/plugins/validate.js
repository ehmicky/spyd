export const name = 'validate'

export const input = true

// Apply `validate(value, opts)` which throws on validation errors
export const main = async function (validate, value) {
  await validate(value)
}
