import './ProductPage.css'
import {getProduct} from "../../api/products/actions.tsx";
import {useState} from "react";
import {useQuery} from '@tanstack/react-query';
import {useParams} from "react-router-dom";

export default function ProductPage() {
  const {id} = useParams();
  const productId = Number(id);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {data: product, isLoading, error} = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
  });

  const goNext = () => {
    setPhotoIndex((prev) => (prev + 1) % product.photos.length);
  };

  const goPrev = () => {
    setPhotoIndex((prev) => (prev - 1 + product.photos.length) % product.photos.length);
  };

  if (isLoading) return <div className='loader'>Загрузка...</div>;
  if (error) return <div className='error'>Ошибка загрузки</div>;
  if (!product) return <div className='error'>Товар не найден</div>;

  return (
    <>
      <div className='product-page'>
        <div className='product-container'>
          {/* Левая колонка — фото */}
          <div className='product-gallery'>
            <div className='main-image-wrapper'>
              <img
                onClick={() => setIsModalOpen(!isModalOpen)}
                src={product.photos[photoIndex]}
                alt={product.name}
                className='main-image'
              />
              {product.photos?.length > 1 && (
                <div className='gallery-nav'>
                  <button className='nav-btn prev' onClick={goPrev}>‹</button>
                  <span className='photo-counter'>
                  {photoIndex + 1} / {product.photos.length}
                </span>
                  <button className='nav-btn next' onClick={goNext}>›</button>
                </div>
              )}
            </div>
            {/* Миниатюры */}
            {product.photos?.length > 1 && (
              <div className='thumbnails'>
                {product.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`${product.name} ${idx + 1}`}
                    className={`thumbnail ${idx === photoIndex ? 'active' : ''}`}
                    onClick={() => setPhotoIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Правая колонка — информация */}
          <div className='product-info'>
            <h1 className='product-title'>{product.name}</h1>
            <div className='product-price'>{product.price.toLocaleString()} ₽</div>
            <div className='product-description'>
              <p>{product.about}</p>
            </div>
            <div className='product-actions'>
              <div className='button-container'>
                <button className='button'>
                  В корзину
                </button>
              </div>
            </div>
            {product.description && (
              <div className='product-specs'>
                <h3>Характеристики</h3>
                <ul>
                  <li><span>Тип:</span> {product.description.type || '—'}</li>
                  <li><span>Цвет:</span> {product.description.color || '—'}</li>
                  <li><span>Объём:</span> {product.description.volume || '—'}</li>
                  <li><span>Диаметр:</span> {product.description.diameter || '—'}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className='modal-overlay' onClick={() => setIsModalOpen(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={() => setIsModalOpen(false)}>×</button>
            <img
              src={product.photos[photoIndex]}
              alt={product.name}
              className='modal-image'
            />
            <div className='modal-nav'>
              <button onClick={goPrev}>‹</button>
              <span>{photoIndex + 1} / {product.photos.length}</span>
              <button onClick={goNext}>›</button>
            </div>
          </div>
        </div>
      )}
    </>

  );
}