//остановился на 34.8 метод Patch
import { Request, Response, Router } from 'express'
import { CommentCreatePayload, ICommentEntity } from '../../types'
import { IComment } from '@Shared/types'
import { validateComment } from '../helpers/validateComment'
import { v4 as uuidv4 } from 'uuid'
import { connection } from '../../index'
import { mapCommentsEntity } from '../helpers/mappingFunctions'
import { OkPacket } from 'mysql2'
import {
  FIND_DUPLICATE_QUERY,
  GET_ALL_COMMENTS_QUERY,
  INSERT_COMMENT_QUERY,
  DELETE_COMMENT_QUERY_BY_COMMENT_ID,
  createUpdateQuery,
} from '../services/queries'
import { throwServerError } from '../helpers/throwServerError'
import { param, validationResult } from 'express-validator'

export const commentsRouter = Router()

commentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [comments] = await connection.query<ICommentEntity[]>(
      GET_ALL_COMMENTS_QUERY
    )
    res.setHeader('Content-Type', 'application/json')
    res.send(mapCommentsEntity(comments))
  } catch (e) {
    throwServerError(res, e)
  }
})

commentsRouter.get(
  `/:id`,
  [param('id').isUUID().withMessage('Comment id is not UUID')],
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400)
        res.json({ errors: errors.array() })
        return
      }
      const id = req.params.id
      const [rows] = await connection.query<ICommentEntity[]>(
        `${GET_ALL_COMMENTS_QUERY} WHERE comment_id = ?`,
        [id]
      )

      if (!rows[0]) {
        res.status(404)
        res.send(`Comment with id ${id} is not found`)
      }

      res.setHeader('Content-Type', 'application/json')
      res.send(mapCommentsEntity(rows)[0])
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

commentsRouter.post(
  '/',
  async (req: Request<{}, {}, CommentCreatePayload>, res: Response) => {
    const validationResult = validateComment(req.body)

    if (validationResult) {
      res.status(400)
      res.setHeader('Content-Type', 'text/text')
      res.send(validationResult)
      return
    }

    try {
      const { name, email, body, productId } = req.body

      const [sameResult] = await connection.query<ICommentEntity[]>(
        FIND_DUPLICATE_QUERY,
        [email.toLowerCase(), name.toLowerCase(), body.toLowerCase(), productId]
      )

      if (sameResult.length) {
        res.status(422)
        res.send('Comment with the same fields already exists')
        return
      }

      const id = uuidv4()

      const [info] = await connection.query<OkPacket>(INSERT_COMMENT_QUERY, [
        id,
        email,
        name,
        body,
        productId,
      ])

      res.status(201)
      res.send(`Comment id: ${id} has been added!`)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

commentsRouter.patch(
  '/',
  async (req: Request<{}, {}, Partial<IComment>>, res: Response) => {
    try {
      const paramsForQuery = createUpdateQuery(req.body)

      const [info] = await connection.query<OkPacket>(
        paramsForQuery.updateQuery,
        paramsForQuery.valuesToUpdate
      )

      if (info.affectedRows === 1) {
        res.status(200)
        res.end()
        return
      }

      const newComment = req.body as CommentCreatePayload
      const validationResult = validateComment(newComment)

      if (validationResult) {
        res.status(400)
        res.send(validationResult)
        return
      }

      const id = uuidv4()

      await connection.query<OkPacket>(INSERT_COMMENT_QUERY, [
        id,
        newComment.email,
        newComment.name,
        newComment.body,
        newComment.productId,
      ])

      res.status(201)
      res.send({ ...newComment, id })
    } catch (e) {
      throwServerError(res, e)
    }
  }
)

commentsRouter.delete(
  `/:id`,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id

      const [info] = await connection.query<OkPacket>(
        DELETE_COMMENT_QUERY_BY_COMMENT_ID,
        [id]
      )

      if (info.affectedRows === 1) {
        res.status(200)
        res.end()
        return
      }

      res.status(404)
      res.send(`Comment with id ${id} is not found`)
    } catch (e) {
      throwServerError(res, e)
    }
  }
)
