import { isUUID } from 'validator'

export const validateRemoveSimilarProductsBody = (
  items: string[] = []
): boolean => {
  if (!Array.isArray(items)) {
    throw new Error('Request body is not array')
  }

  if (!items.length) {
    throw new Error('An array is empty')
  }

  items?.forEach((id: string, index) => {
    if (!isUUID(id)) {
      throw new Error(`Value ${id} with index ${index}is not UUID`)
    }
  })
  return true
}
