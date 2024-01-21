import { IComment } from '@Shared/types'
// Comments queries

export const GET_ALL_COMMENTS_QUERY = `
SELECT * FROM comments
`

export const FIND_DUPLICATE_QUERY = `
SELECT * FROM comments c
WHERE LOWER(c.email) = ?
AND LOWER(c.name) = ?
AND LOWER(c.body) = ?
AND c.product_id = ?
`

export const INSERT_COMMENT_QUERY = `
INSERT INTO comments
(comment_id, email, name, body, product_id)
VALUES
(?, ?, ?, ?, ?)
`

export const DELETE_COMMENT_QUERY_BY_COMMENT_ID = `
DELETE FROM comments WHERE comment_id = ?
`

export const DELETE_COMMENT_QUERY_BY_PRODUCT_ID = `
DELETE FROM comments WHERE product_id = ?
`

export const createUpdateQuery = (body: Partial<IComment>) => {
  let updateQuery = 'UPDATE comments SET '

  const valuesToUpdate = []
  const fields = ['name', 'body', 'email']
  fields.forEach((fieldName) => {
    if (body.hasOwnProperty(fieldName)) {
      if (valuesToUpdate.length) {
        updateQuery += ', '
      }

      updateQuery += `${fieldName} = ?`
      valuesToUpdate.push(body[fieldName])
    }
  })

  updateQuery += ' WHERE comment_id = ?'
  valuesToUpdate.push(body.id)
  return { updateQuery, valuesToUpdate }
}

// Products queries

export const GET_ALL_PRODUCTS_QUERY = `
SELECT * FROM products
`

export const INSERT_PRODUCT_QUERY = `
INSERT INTO products
(product_id, title, description, price)
VALUES
(?, ?, ?, ?)
`

export const DELETE_PRODUCT_QUERY = `
DELETE FROM products WHERE product_id = ?
`

export const GET_SIMILAR_PRODUCTS_QUERY = `
SELECT * FROM similar_products WHERE first_product = ? OR second_product = ?
`

export const INSERT_SIMILAR_PRODUCT_QUERY = `
INSERT INTO similar_products (first_product, second_product)
VALUES ?
`
//Images queries

export const GET_ALL_IMAGES_QUERY = `SELECT * FROM images`

export const INSERT_IMAGES_QUERY = `
INSERT INTO images (image_id, url, product_id, main)
VALUES ?
`

export const DELETE_IMAGE_QUERY_BY_PRODUCT_ID = `
DELETE FROM images WHERE product_id = ?
`

export const DELETE_IMAGE_QUERY_BY_IMAGE_ID = `
DELETE FROM images 
  WHERE image_id IN ?;
`

export const REPLACE_PRODUCT_THUMBNAIL = `
  UPDATE images
  SET main = CASE
    WHEN image_id = ? THEN 0
    WHEN image_id = ? THEN 1
    ELSE main
END
WHERE image_id IN (?, ?);
`
export const UPDATE_PRODUCT_FIELDS = `
UPDATE products 
SET title = ?, description = ?, price = ? 
WHERE product_id = ?
`

export const DELETE_SIMILAR_PRODUCTS_QUERY = `
DELETE FROM similar_products
  WHERE first_product IN (?) OR second_product IN (?);
`

export const AUTH_QUERY = `SELECT * FROM users WHERE username = ? AND password = ?`
