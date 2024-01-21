import { Request, Response, Router } from 'express'
import { connection } from '../../index'
import { v4 as uuidv4 } from 'uuid'

import { throwServerError } from '../helpers/throwServerError'
import { enhanceProductComments } from '../helpers/enhanceProductComments'
import { enhanceProductImages } from '../helpers/enhanceProductImages'
import { getProductFilterQuery } from '../helpers/productFilterQuery'
import { validateAddSimilarProductsBody } from '../helpers/validateAddSimilarProductsBody'
import { validateRemoveSimilarProductsBody } from '../helpers/validateRemoveSimilarProductsBody'

import { OkPacket } from 'mysql2'
import { param, validationResult, body } from 'express-validator'

import {
  ICommentEntity,
  IProductEntity,
  ProductCreatePayload,
  IImageEntity,
  ProductAddImagesPayload,
  ImagesRemovePayload,
  SimilarProductEntity,
  AddSimilarProductsPayload,
} from '../../types'

import { IProductFilterPayload, IProduct } from '@Shared/types'

import {
  DELETE_PRODUCT_QUERY,
  GET_ALL_COMMENTS_QUERY,
  GET_ALL_PRODUCTS_QUERY,
  GET_ALL_IMAGES_QUERY,
  INSERT_PRODUCT_QUERY,
  INSERT_IMAGES_QUERY,
  DELETE_COMMENT_QUERY_BY_PRODUCT_ID,
  DELETE_IMAGE_QUERY_BY_PRODUCT_ID,
  DELETE_IMAGE_QUERY_BY_IMAGE_ID,
  REPLACE_PRODUCT_THUMBNAIL,
  UPDATE_PRODUCT_FIELDS,
  GET_SIMILAR_PRODUCTS_QUERY,
  INSERT_SIMILAR_PRODUCT_QUERY,
  DELETE_SIMILAR_PRODUCTS_QUERY,
} from '../services/queries'

import {
  mapProductsEntity,
  mapCommentsEntity,
  mapImagesEntity,
} from '../helpers/mappingFunctions'
import { createImageData } from '../helpers/createImageData'

export const productsRouter = Router()

productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [productsRows] = await connection.query<IProductEntity[]>(
      GET_ALL_PRODUCTS_QUERY
    )

    const [commentRows] = await connection.query<ICommentEntity[]>(
      GET_ALL_COMMENTS_QUERY
    )

    const [imageRows] = await connection.query<IImageEntity[]>(
      GET_ALL_IMAGES_QUERY
    )

    const products = mapProductsEntity(productsRows)
    const productsWithComments = enhanceProductComments(products, commentRows)
    const result = enhanceProductImages(productsWithComments, imageRows)

    res.send(result)
  } catch (e) {
    throwServerError(res, e)
  }
})

productsRouter.get(
  '/search',
  async (req: Request<{}, {}, {}, IProductFilterPayload>, res: Response) => {
    try {
      const [query, values] = getProductFilterQuery(req.query)
      const [rows] = await connection.query<IProductEntity[]>(query, values)

      if (!rows?.length) {
        res.status(404)
        res.send(`Products are not found`)
        return
      }

      const [commentRows] = await connection.query<ICommentEntity[]>(
        GET_ALL_COMMENTS_QUERY
      )

      const [imageRows] = await connection.query<IImageEntity[]>(
        GET_ALL_IMAGES_QUERY
      )
      const products = mapProductsEntity(rows)
      const productsWithComments = enhanceProductComments(products, commentRows)
      const result = enhanceProductImages(productsWithComments, imageRows)

      res.send(result)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.get(
  '/:id',
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const [rows] = await connection.query<IProductEntity[]>(
        `${GET_ALL_PRODUCTS_QUERY} WHERE product_id = ?`,
        [req.params.id]
      )

      if (!rows?.[0]) {
        res.status(404)
        res.send(`Product with id ${req.params.id} is not found`)
        return
      }

      const [comments] = await connection.query<ICommentEntity[]>(
        `${GET_ALL_COMMENTS_QUERY} WHERE product_id = ?`,
        [req.params.id]
      )

      const [images] = await connection.query<IImageEntity[]>(
        `${GET_ALL_IMAGES_QUERY} WHERE product_id = ?`,
        [req.params.id]
      )

      const product = mapProductsEntity(rows)[0]
      if (comments.length) {
        product.comments = mapCommentsEntity(comments)
      }

      if (images.length) {
        product.images = mapImagesEntity(images)
        product.images.forEach((image) => {
          if (image.main) {
            product.thumbnail = image
          }
        })
      }

      res.send(product)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.get(
  '/similar/:id',
  [param('id').isUUID().withMessage('Product id is not UUID')],
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const originProduct = req.params.id

      const [rows] = await connection.query<SimilarProductEntity[]>(
        GET_SIMILAR_PRODUCTS_QUERY,
        [originProduct, originProduct]
      )

      if (!rows?.length) {
        return res.send([])
      }

      const similarProductsIds = rows.map(
        ({ first_product, second_product }) => {
          return first_product === originProduct
            ? second_product
            : first_product
        }
      )

      const [similarProducts] = await connection.query<IProductEntity[]>(
        'SELECT * FROM products WHERE product_id IN (?)',
        [similarProductsIds]
      )

      const productsList: IProduct[] = similarProducts.map(
        ({ product_id, ...rest }) => {
          return {
            id: product_id,
            ...rest,
          }
        }
      )

      res.send(productsList)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.post(
  '/',
  async (req: Request<{}, {}, ProductCreatePayload>, res: Response) => {
    try {
      const { title, description, price, images } = req.body
      const productId: string = uuidv4()
      await connection.query<OkPacket>(INSERT_PRODUCT_QUERY, [
        productId,
        title || null,
        description || null,
        price || null,
      ])

      if (images) {
        const imageDataArray = createImageData(productId, images)
        await connection.query<OkPacket>(INSERT_IMAGES_QUERY, [imageDataArray])
      }

      const [rows] = await connection.query<IProductEntity[]>(
        'SELECT * FROM products WHERE product_id = ?',
        [productId]
      )

      const product = mapProductsEntity(rows)[0]

      res.status(200)
      res.send(product)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.post(
  '/add-images',
  async (req: Request<{}, {}, ProductAddImagesPayload>, res: Response) => {
    try {
      const { productId, images } = req.body

      if (!images?.length) {
        res.status(400)
        res.send('Images array is empty')
        return
      }

      const imageDataArray = createImageData(productId, images)
      await connection.query<OkPacket>(INSERT_IMAGES_QUERY, [imageDataArray])

      res.status(201)
      res.send(`Images into product id:${productId} have been added`)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.post(
  '/remove-image',
  async (req: Request<{}, {}, ImagesRemovePayload>, res: Response) => {
    try {
      const imagesToRemove = req.body

      if (!imagesToRemove?.length) {
        res.status(400)
        res.send('Images array is empty')
        return
      }

      const [info] = await connection.query<OkPacket>(
        DELETE_IMAGE_QUERY_BY_IMAGE_ID,
        [[imagesToRemove]]
      )

      if (info.affectedRows === 0) {
        res.status(404)
        res.send('No one image has been removed')
        return
      }

      res.status(200)
      res.send(`Images have been removed!`)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.post(
  '/add-similar',
  [body().custom(validateAddSimilarProductsBody)],
  async (req: Request<{}, {}, AddSimilarProductsPayload>, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      await connection.query<OkPacket>(INSERT_SIMILAR_PRODUCT_QUERY, [req.body])

      res.status(201).send()
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.post(
  '/remove-similar',
  [body().custom(validateRemoveSimilarProductsBody)],
  async (req: Request<{}, {}, string[]>, res: Response) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const [info] = await connection.query<OkPacket>(
        DELETE_SIMILAR_PRODUCTS_QUERY,
        [req.body, req.body]
      )

      res.send(`${info.affectedRows} rows have been removed`)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.delete(
  '/:id',
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      await connection.query<OkPacket>(
        DELETE_COMMENT_QUERY_BY_PRODUCT_ID,
        req.params.id
      )

      await connection.query<OkPacket>(
        DELETE_IMAGE_QUERY_BY_PRODUCT_ID,
        req.params.id
      )

      const [info] = await connection.query<OkPacket>(
        DELETE_PRODUCT_QUERY,
        req.params.id
      )

      if (info.affectedRows === 0) {
        res.status(404)
        res.send(`Product with id ${req.params.id} is not found`)
        return
      }

      res.status(200)
      res.end()
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.post(
  '/update-thumbnail/:id',
  async (
    req: Request<{ id: string }, {}, { newThumbnailId: string }>,
    res: Response
  ) => {
    try {
      const [currentThumbnailRows] = await connection.query<IImageEntity[]>(
        'SELECT * FROM images WHERE product_id=? AND main=?',
        [req.params.id, 1]
      )

      if (!currentThumbnailRows?.length || currentThumbnailRows.length > 1) {
        res.status(400)
        res.send('Incorrect product id')
        return
      }

      const [newThumbnailRows] = await connection.query<IImageEntity[]>(
        'SELECT * FROM images WHERE product_id=? AND image_id=?',
        [req.params.id, req.body.newThumbnailId]
      )

      if (newThumbnailRows?.length !== 1) {
        res.status(400)
        res.send('Incorrect new thumbnail id')
        return
      }

      const currentThumbnailId = currentThumbnailRows[0].image_id
      const [info] = await connection.query<OkPacket>(
        REPLACE_PRODUCT_THUMBNAIL,
        [
          currentThumbnailId,
          req.body.newThumbnailId,
          currentThumbnailId,
          req.body.newThumbnailId,
        ]
      )

      if (info.affectedRows === 0) {
        res.status(404)
        res.send('No one image has been updated')
        return
      }

      res.status(200)
      res.send('New product thumbnail has been set!')
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

productsRouter.patch(
  '/:id',
  async (
    req: Request<{ id: string }, {}, ProductCreatePayload>,
    res: Response
  ) => {
    try {
      const { id } = req.params

      const [rows] = await connection.query<IProductEntity[]>(
        'SELECT * FROM products WHERE product_id = ?',
        [id]
      )

      if (!rows?.[0]) {
        res.status(404)
        res.send(`Product with id ${id} is not found`)
        return
      }

      const currentProduct = rows[0]
      await connection.query<OkPacket>(UPDATE_PRODUCT_FIELDS, [
        req.body.hasOwnProperty('title')
          ? req.body.title
          : currentProduct.title,
        req.body.hasOwnProperty('description')
          ? req.body.description
          : currentProduct.description,
        req.body.hasOwnProperty('price')
          ? req.body.price
          : currentProduct.price,
        id,
      ])

      res.status(200)
      res.send(`Product id:${id} has been added!`)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)
