import { RowDataPacket } from 'mysql2'
import { IComment, IProduct, IImage, IAuthRequisites } from '@Shared/types'
//Comments types

export type CommentCreatePayload = Omit<IComment, 'id'>

export interface ICommentEntity extends RowDataPacket {
  comment_id: string
  name: string
  email: string
  body: string
  product_id: string
}

//Products types
export interface IProductEntity extends IProduct, RowDataPacket {
  product_id: string
}

export interface SimilarProductEntity extends RowDataPacket {
  first_product: string
  second_product: string
}

export type AddSimilarProductsPayload = [string, string][]

export type ProductCreatePayload = Omit<IProduct, 'id' | 'comments'>

//Images types

export type ImageData = Array<string | number>

export interface IImageEntity extends RowDataPacket {
  image_id: string
  url: string
  product_id: string
  main: number
}

export type ImageCreatePayload = Omit<IImage, 'id' | 'productId'>

export interface ProductAddImagesPayload {
  productId: string
  images: ImageCreatePayload[]
}

export type ImagesRemovePayload = string[]
export type SimilarProductsRemovePayload = string[]

//User Types
export interface IUserRequisitesEntity extends IAuthRequisites, RowDataPacket {
  id: number
}
