import {
  ICommentEntity,
  IImageEntity,
  IProductEntity,
  SimilarProductEntity,
} from '../../types'
import { IComment, IProduct, IImage } from '@Shared/types'

export const mapCommentEntity = ({
  comment_id,
  product_id,
  ...rest
}: ICommentEntity): IComment => {
  return {
    id: comment_id,
    productId: product_id,
    ...rest,
  }
}

export const mapCommentsEntity = (data: ICommentEntity[]): IComment[] => {
  return data.map(mapCommentEntity)
}

export const mapImageEntity = ({
  image_id,
  product_id,
  main,
  ...rest
}: IImageEntity): IImage => {
  return {
    id: image_id,
    productId: product_id,
    main: main === 0 ? false : true,
    ...rest,
  }
}

export const mapImagesEntity = (data: IImageEntity[]): IImage[] => {
  return data.map(mapImageEntity)
}

export const mapProductsEntity = (data: IProductEntity[]): IProduct[] => {
  return data.map(({ product_id, title, description, price }) => ({
    id: product_id,
    title: title || '',
    description: description || '',
    price: Number(price) || 0,
  }))
}
