import { IProduct } from '@Shared/types'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import placeholder from '../../../img/product-placeholder.png'
import axios from 'axios'
import { URL } from '../../../const'

interface Props {
  products: IProduct[]
}

const usePathname = () => {
  const location = useLocation()
  return location.pathname
}

function ProductPage({ products }: Props) {
  const [product, setProduct] = useState<IProduct>()
  const [similarProducts, setSimilarProducts] = useState<IProduct[]>()
  const pathname = usePathname()

  useEffect(() => {
    const regexForId = /[^\/:]/g
    const id = pathname.match(regexForId)?.join('')
    axios
      .get<{}, { data: IProduct }>(`${URL}/api/products/${id}`)
      .then((res) => setProduct(res.data))

    axios
      .get<{}, { data: IProduct[] }>(`${URL}/api/products/similar/${id}`)
      .then((res) => {
        setSimilarProducts(res.data)
      })
  }, [product])

  return (
    <>
      {product ? (
        <div className="product">
          <h3 className="productTitle">{product.title}</h3>
          <img
            className="productImg"
            src={product.thumbnail ? product.thumbnail.url : placeholder}
            alt="thumbnail"
          />
          <div className="productDescr">{product.description}</div>
          <div className="productPrice">Цена: {product.price}</div>
          <h4 className="productTitle">Еще изображения</h4>
          <ul className="imgList">
            {product.images ? (
              product.images.map((img) => (
                <li key={img.id}>
                  <img src={img.url} alt="images" />
                </li>
              ))
            ) : (
              <div className="empty">Изображения отсутствуют</div>
            )}
          </ul>
          <h4 className="productTitle">Комментарии</h4>
          <ul className="commentList">
            {product.comments ? (
              product.comments.map((comment) => (
                <li key={comment.id} className="comment">
                  <h5 className="commentTitle">{comment.name}</h5>
                  <div className="commentEmail">{comment.email}</div>
                  <div className="commentText">{comment.body}</div>
                </li>
              ))
            ) : (
              <div className="empty">Комментарии отсутствуют</div>
            )}
          </ul>
          <h4 className="productTitle">Похожие товары</h4>
          <ul className="similarList">
            {similarProducts?.length ? (
              similarProducts.map((similarProduct) => (
                <li className="similarProduct" key={similarProduct.id}>
                  <Link to={`/:${similarProduct.id}`}>
                    <h5 className="productTitle">{similarProduct.title}</h5>
                    <div className="productPrice">
                      Цена: {similarProduct.price}
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <div className="empty">Похожие товары отсутствуют</div>
            )}
          </ul>
        </div>
      ) : (
        'Продукт отсутствует'
      )}
    </>
  )
}
export default ProductPage
