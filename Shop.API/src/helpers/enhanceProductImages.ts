import { IImageEntity } from '../../types'
import { IProduct, IImage } from '@Shared/types'
import { mapImageEntity } from './mappingFunctions'

export const enhanceProductImages = (
  products: IProduct[],
  imageRows: IImageEntity[]
): IProduct[] => {
  const imageByProductId = new Map<string, IImage[]>()

  for (let imageEntity of imageRows) {
    const image = mapImageEntity(imageEntity)

    if (!imageByProductId.has(image.productId)) {
      imageByProductId.set(image.productId, [])
    }
    const list = imageByProductId.get(image.productId)
    imageByProductId.set(image.productId, [...list, image])
  }

  for (let product of products) {
    if (imageByProductId.has(product.id)) {
      product.images = imageByProductId.get(product.id)

      product.images.forEach((image) => {
        if (image.main) {
          product.thumbnail = image
        }
      })
    }
  }
  return products
}
