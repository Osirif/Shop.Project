import { ICommentEntity } from '../../types'
import { IComment, IProduct } from '@Shared/types'
import { mapCommentEntity } from './mappingFunctions'

export const enhanceProductComments = (
  products: IProduct[],
  commentRows: ICommentEntity[]
): IProduct[] => {
  const commentsByProductId = new Map<string, IComment[]>()

  for (let commentEntity of commentRows) {
    const comment = mapCommentEntity(commentEntity)
    if (!commentsByProductId.has(comment.productId)) {
      commentsByProductId.set(comment.productId, [])
    }
    const list = commentsByProductId.get(comment.productId)
    commentsByProductId.set(comment.productId, [...list, comment])
  }

  for (let product of products) {
    if (commentsByProductId.has(product.id)) {
      product.comments = commentsByProductId.get(product.id)
    }
  }
  return products
}
