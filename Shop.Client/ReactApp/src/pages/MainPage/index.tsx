import { Link } from 'react-router-dom'
import './mainPage.css'

interface Props {
  productsCount: number
  sumPrice: number
}

function MainPage({ productsCount, sumPrice }: Props) {
  return (
    <>
      <h2 className="title">Shop.Client</h2>
      <p className="text">
        В базе данных находится {productsCount} товаров общей стоимостью{' '}
        {sumPrice}»
      </p>
      <div className="buttons">
        <Link to="/products-list">Перейти к списку товаров</Link>
        <a href="/admin" target="_blank">
          Перейти в систему администрирования
        </a>
      </div>
    </>
  )
}

export default MainPage
