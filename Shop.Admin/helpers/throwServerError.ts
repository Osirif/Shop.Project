import { Response } from 'express'

export const throwServerError = (res: Response, e: Error) => {
  res.status(500)
  res.send(e.message)
}
