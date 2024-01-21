import { IProduct } from '@Shared/types'
import { Link } from 'react-router-dom'
import placeholder from '../../img/product-placeholder.png'
import './productsPage.css'

interface Props {
  products: IProduct[]
}

function ProductsPage({ products }: Props) {
  return (
    <>
      <h2 className="title">Список товров ({products.length})</h2>
      <ul className="productsList">
        {products.map((product) => (
          <li key={product.id} className="product">
            <Link to={`/:${product.id}`}>
              <h3 className="productTitle">{product.title}</h3>
              <img
                className="productImg"
                src={product.thumbnail ? product.thumbnail.url : placeholder}
                alt="thumbnail"
              />
            </Link>
            <div className="productPrice">{product.price}</div>
            <div className="productComments">
              {product.comments
                ? 'Комментарии' + ' (' + product.comments.length + ')'
                : 'Комментарии отсутствуют'}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default ProductsPage
