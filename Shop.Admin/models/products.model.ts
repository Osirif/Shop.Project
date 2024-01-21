//Остановился на 4 пункте задания 35.3.1
import axios from 'axios'
import { IProduct, IProductFilterPayload } from '@Shared/types'
import { IProductEditData } from '../types'
import { splitNewImages } from '../helpers/splitNewImages'
import { compileIdsToRemove } from '../helpers/compileIdsToRemove'
import { HOST } from './const'

export async function getProducts(): Promise<IProduct[]> {
  const { data } = await axios.get<IProduct[]>(`${HOST}/products`)
  return data || []
}

export async function getProduct(id: string): Promise<IProduct | null> {
  try {
    const { data } = await axios.get<IProduct>(`${HOST}/products/${id}`)
    return data
  } catch (e) {
    return null
  }
}

export async function getSimilarProducts(
  originProductId: string
): Promise<IProduct[] | null> {
  try {
    const { data } = await axios.get<IProduct[]>(
      `${HOST}/products/similar/${originProductId}`
    )
    return data
  } catch (e) {
    return null
  }
}

export async function getNotSimilarProducts(
  originProductId: string,
  similarProducts: IProduct[] = []
): Promise<IProduct[] | []> {
  try {
    const similarIdsSet = new Set(similarProducts.map(({ id }) => id))

    const { data = [] } = await axios.get<IProduct[]>(`${HOST}/products`)
    return data.filter((product) => {
      return product.id !== originProductId && !similarIdsSet.has(product.id)
    })
  } catch (e) {
    return null
  }
}

export async function searchProducts(
  filter: IProductFilterPayload
): Promise<IProduct[]> {
  const { data } = await axios.get<IProduct[]>(`${HOST}/products/search`, {
    params: filter,
  })
  return data || []
}

export async function removeProduct(id: string): Promise<void> {
  await axios.delete(`${HOST}/products/${id}`)
}

export async function updateProduct(
  productId: string,
  formData: IProductEditData
): Promise<void> {
  try {
    const { data: currentProduct } = await axios.get<IProduct>(
      `${HOST}/products/${productId}`
    )

    if (formData.commentsToRemove) {
      if (typeof formData.commentsToRemove === 'string') {
        await axios.delete(`${HOST}/comments/${formData.commentsToRemove}`)
      } else {
        formData.commentsToRemove.forEach(async (commentId) => {
          await axios.delete(`${HOST}/comments/${commentId}`)
        })
      }
    }

    if (formData.imagesToRemove) {
      if (typeof formData.imagesToRemove === 'string') {
        await axios.post(`${HOST}/products/remove-image`, [
          formData.imagesToRemove,
        ])
      } else {
        const arrayToDel = []
        formData.imagesToRemove.forEach(async (imageId) => {
          arrayToDel.push(imageId)
        })
        await axios.post(`${HOST}/products/remove-image`, arrayToDel)
      }
    }

    if (formData.newImages) {
      const urls = splitNewImages(formData.newImages)
      const images = urls.map((url) => ({ url, main: false }))
      if (!currentProduct.thumbnail) {
        images[0].main = true
      }
      await axios.post(`${HOST}/products/add-images`, { productId, images })
    }

    if (
      formData.mainImage &&
      formData.mainImage !== currentProduct?.thumbnail?.id
    ) {
      await axios.post(`${HOST}/products/update-thumbnail/${productId}`, {
        newThumbnailId: formData.mainImage,
      })
    }

    if (formData.similarToRemove) {
      const ids = compileIdsToRemove(formData.similarToRemove)
      await axios.post(`${HOST}/products/remove-similar`, ids)
    }

    if (formData.similarToAdd) {
      const ids = compileIdsToRemove(formData.similarToAdd)
      const pairs = ids.map((id) => [productId, id])
      await axios.post(`${HOST}/products/add-similar`, pairs)
    }

    await axios.patch(`${HOST}/products/${productId}`, {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
    })
  } catch (e) {
    console.log(e) // фиксируем ошибки, которые могли возникнуть в процессе
  }
}

export async function createProduct(
  formData: IProductEditData
): Promise<IProduct | null> {
  try {
    const payload: IProduct = {
      id: '',
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
    }

    const { data } = await axios.post<IProduct>(`${HOST}/products`, payload)
    return data
  } catch (e) {
    return null
  }
}
