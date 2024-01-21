import { IAuthRequisites } from '@Shared/types'
import { Router, Request, Response } from 'express'
import { IUserRequisitesEntity } from '../../types'
import { AUTH_QUERY } from '../services/queries'
import { connection } from '../../index'
import { body, validationResult } from 'express-validator'

export const authRouter = Router()

authRouter.post(
  '/',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request<{}, {}, IAuthRequisites>, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400)
      res.json({ error: errors.array() })
      return
    }

    const { username, password } = req.body
    const [data] = await connection.query<IUserRequisitesEntity[]>(AUTH_QUERY, [
      username,
      password,
    ])

    if (!data?.length) {
      res.status(404)
    }
    res.send()
  }
)
