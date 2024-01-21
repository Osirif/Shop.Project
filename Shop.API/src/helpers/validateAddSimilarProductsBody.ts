import { AddSimilarProductsPayload } from '../../types'
import { isUUID } from 'validator'
export const validateAddSimilarProductsBody = (
  items: AddSimilarProductsPayload = []
): boolean => {
  if (!Array.isArray(items)) {
    throw new Error('Request body is not an array')
  }

  if (!items.length) {
    throw new Error('An array is empty')
  }

  items?.forEach((connection: [string, string], index) => {
    if (
      connection?.length !== 2 ||
      typeof connection?.[0] !== 'string' ||
      typeof connection?.[1] !== 'string'
    ) {
      throw new Error(
        `An array element with index ${index} doesn't match a pair of ids`
      )
    }

    if (!isUUID(connection[0])) {
      throw new Error(
        `Value ${connection[0]} of the element with index ${index} is not UUID`
      )
    }

    if (!isUUID(connection[1])) {
      throw new Error(
        `Value ${connection[1]} of the element with index ${index} is not UUID`
      )
    }
  })
  return true
}
