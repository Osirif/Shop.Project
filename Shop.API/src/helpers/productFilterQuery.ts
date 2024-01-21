import { IProductFilterPayload } from '@Shared/types'

export const getProductFilterQuery = (
  filter: IProductFilterPayload
): [string, string[]] => {
  const { title, description, priceFrom, priceTo } = filter
  let query = 'SELECT * FROM products WHERE '
  const values = []

  if (title) {
    query += 'title LIKE ? '
    values.push(`%${title}%`)
  }

  if (description) {
    if (values.length) {
      query += ' OR '
    }
    query += 'description LIKE ? '
    values.push(`%${description}%`)
  }

  if (priceFrom || priceTo) {
    if (values.length) {
      query += ' OR '
    }
    query += `(price > ? AND price < ?)`
    values.push(priceFrom || 0)
    values.push(priceTo || 999999)
  }

  return [query, values]
}
