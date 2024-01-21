export const throwServerError = (res, e) => {
  res.status(500)
  res.send(e.message)
}
