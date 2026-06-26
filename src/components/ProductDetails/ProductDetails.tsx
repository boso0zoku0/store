import './ProductDetails.css'
import {getProduct} from "../../api/products/actions.tsx";
import {useState} from "react";
import {useQuery} from '@tanstack/react-query';
import {useParams} from "react-router-dom";


export default function ProductDetails() {
  const {id} = useParams();
  const productId = Number(id);

  const [photoIndex, setPhotoIndex] = useState(0)
  const {data: product, isLoading, error} = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
  });
  console.log('product:', product);
  console.log('product?.photos:', product?.photos);
  console.log('product?.photos?.[0]:', product?.photos?.[0]);
  const goNext = () => {
    if (!photoIndex) {
      return
    }
    setPhotoIndex((prev) => (prev + 1) % product.photos.length);
  }
  const goPrev = () => {
    setPhotoIndex((prev) => (prev - 1 + product.photos.length) % product.photos.length);
  }

  if (error) {
    return (
      <div>Ошибка</div>
    )
  }
  if (isLoading) {
    return (
      <div>Загрузка...</div>
    )
  }
  return (
    <div className='main'>
      <section className='mediaContent'>
        {product.photos && product.photos.length > 0 && (
          <>
            <img src={product.photos[photoIndex]} className='photo' alt='product'/>
            <div className='dots'>
              <button className='dotBack' onClick={goPrev}>‹</button>
              <button className='dotForward' onClick={goNext}>›</button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}