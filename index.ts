require('dotenv').config()

import { Express } from 'express'

import { Connection } from 'mysql2/promise'
import { initServer } from './Server/services/server'
import { initDataBase } from './Server/services/db'
import ShopAPI from './Shop.API'
import ShopAdmin from './Shop.Admin'
import ShopClient from './Shop.Client'

export let server: Express
export let connection: Connection

async function launchApplication() {
  server = initServer()
  connection = await initDataBase()

  initRouter()
}

function initRouter() {
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
  })
/*   const shopApi = ShopAPI(connection)
  server.use('/api', shopApi) */

  const shopAdmin = ShopAdmin()
  server.use('/admin', shopAdmin)

  const shopClient = ShopClient()
  server.use('/', shopClient)
}

launchApplication()
