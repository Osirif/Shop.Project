import { ImageCreatePayload, ImageData } from '../../types'
import { v4 as uuidv4 } from 'uuid'

export const createImageData = (
  productId: string,
  images: ImageCreatePayload[]
): ImageData[] => {
  const imageDataArray: ImageData[] = []
  images.forEach((image) => {
    const imageId = uuidv4()
    const imageData: ImageData = []
    imageData.push(imageId, image.url, productId, Number(image.main))
    imageDataArray.push(imageData)
  })
  return imageDataArray
}
