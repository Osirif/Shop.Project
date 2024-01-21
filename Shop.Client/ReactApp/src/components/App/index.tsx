import './App.css'
import Header from '../Header'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPage from '../../pages/MainPage'
import ProductsPage from '../../pages/ProductsPage'
import ProductPage from '../../pages/ProductsPage/ProductPage'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { URL } from '../../const'
import { IProduct } from '@Shared/types'

function App() {
  const [products, setProducts] = useState<IProduct[]>([])

  const sumPrice = () => {
    let sum = 0
    products.forEach((product) => (sum += product.price))
    return sum
  }

  useEffect(() => {
    const reqProducts = async () => await axios.get(`${URL}/api/products`)
    const data = reqProducts()
    let resultArr: IProduct[] = []
    data.then((res) => {
      resultArr = res.data.map(async (dataProduct: IProduct) => {
        const product = await axios.get<{}, { data: IProduct }>(
          `${URL}/api/products/${dataProduct.id}`
        )
        return product.data
      })
      Promise.all(resultArr).then((res) => setProducts(res))
    })
  }, [])

  return (
    <BrowserRouter>
      <div className="App">
        <div className="container">
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <MainPage
                  productsCount={products.length}
                  sumPrice={sumPrice()}
                />
              }
            />
            <Route
              path="/products-list"
              element={<ProductsPage products={products} />}
            />
            <Route path="/:id" element={<ProductPage products={products} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
