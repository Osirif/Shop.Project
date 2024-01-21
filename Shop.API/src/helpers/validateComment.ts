import { CommentCreatePayload } from '../../types'

type CommentValidator = (comment: CommentCreatePayload) => string | null

export const validateComment: CommentValidator = (comment) => {
  if (!comment || !Object.keys(comment).length) {
    return 'Comment is absent or empty'
  }

  const requiredFields = new Set<keyof CommentCreatePayload>([
    'name',
    'email',
    'body',
    'productId',
  ])

  let wrongFieldName

  requiredFields.forEach((fieldName) => {
    if (!comment[fieldName]) {
      wrongFieldName = fieldName
      return
    }
  })

  if (wrongFieldName) {
    return `Field '${wrongFieldName}' is absent`
  }

  return null
}
