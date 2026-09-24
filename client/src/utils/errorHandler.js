/**
 * Normalizes backend error objects into a readable string or object
 * Standard backend response: { success: false, message: string, errors: array }
 */
export function getErrorMessage(error, defaultMessage = 'An unexpected error occurred') {
  if (!error) return defaultMessage

  if (typeof error === 'string') return error

  if (error.message) return error.message

  if (error.response?.data?.message) return error.response.data.message

  return defaultMessage
}

/**
 * Extracts validation error messages by field name
 */
export function getFieldErrors(error) {
  const errors = error?.errors || error?.response?.data?.errors || []
  if (!Array.isArray(errors)) return {}

  return errors.reduce((acc, curr) => {
    if (curr.field && curr.message) {
      acc[curr.field] = curr.message
    }
    return acc
  }, {})
}

/**
 * Convenience helper returning both message and field errors
 */
export function handleApiError(error, defaultMessage) {
  return {
    message: getErrorMessage(error, defaultMessage),
    fieldErrors: getFieldErrors(error),
  }
}
