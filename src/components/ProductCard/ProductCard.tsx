import styles from './ProductCard.module.css'
import {useNavigate} from "react-router-dom";
import {useState, useRef, useEffect} from 'react';
import axios from "axios";
import type {CartItem} from "../interfaces.tsx";

export default function ProductCards() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<CartItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [hoverStates, setHoverStates] = useState<Record<number, boolean>>({});
  const [imageIndices, setImageIndices] = useState<Record<number, number>>({});

  useEffect(() => {
    setProductsLoading(true);
    axios.get("/api/products/")
      .then((result) => {
        console.log('Products loaded:', result.data);
        setProducts(result.data);
      })
      .catch(err => console.error(err))
      .finally(() => setProductsLoading(false));
  }, []);

  const handleMouseEnter = (productId: number) => {
    setHoverStates(prev => ({...prev, [productId]: true}));
  };

  const handleMouseLeave = (productId: number) => {
    setHoverStates(prev => ({...prev, [productId]: false}));
    setImageIndices(prev => ({...prev, [productId]: 0}));
  };

  const handlePrevImage = (e: React.MouseEvent, productId: number, photosLength: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + photosLength) % photosLength
    }));
  };

  const handleNextImage = (e: React.MouseEvent, productId: number, photosLength: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % photosLength
    }));
  };

  const handleDotClick = (e: React.MouseEvent, productId: number, index: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({...prev, [productId]: index}));
  };

  const handleRedirect = async (slug: string) => {
    try {
      await axios.post(`/api/products/add/to-cart?slug=${slug}`,
        {},
        {withCredentials: true}
      );
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      navigate('/cart');
    }
  };

  const openModal = (product: CartItem) => {
    console.log('Opening modal for product:', product);
    setActiveProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveProduct(null);
  };

  if (productsLoading) {
    return <div className={styles.loader}>Loading products...</div>;
  }

  return (
    <>
      <div className={styles.productsGrid}>
        {products.map((product) => {
          const isHovering = hoverStates[product.id] || false;
          const currentIndex = imageIndices[product.id] || 0;
          const photos = product.photos || [];

          return (
            <div
              key={product.id}
              className={styles.productCard}
              onMouseEnter={() => handleMouseEnter(product.id)}
              onMouseLeave={() => handleMouseLeave(product.id)}
              onClick={() => openModal(product)}
            >
              <div className={styles.productImageWrapper}>
                {isHovering && photos.length > 1 && (
                  <>
                    <button
                      className={`${styles.arrow} ${styles.arrowLeft}`}
                      onClick={(e) => handlePrevImage(e, product.id, photos.length)}
                      aria-label="Предыдущее фото"
                    >
                      ‹
                    </button>
                    <button
                      className={`${styles.arrow} ${styles.arrowRight}`}
                      onClick={(e) => handleNextImage(e, product.id, photos.length)}
                      aria-label="Следующее фото"
                    >
                      ›
                    </button>
                  </>
                )}

                <img
                  className={styles.productImage}
                  src={
                    photos[currentIndex]
                      ? `/api/static/media/${photos[currentIndex]}`
                      : '/placeholder.jpg'
                  }
                  alt={product.name}
                  loading="lazy"
                />

                {isHovering && photos.length > 1 && (
                  <div className={styles.dots}>
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        className={`${styles.dot} ${currentIndex === idx ? styles.dotActive : ''}`}
                        onClick={(e) => handleDotClick(e, product.id, idx)}
                        aria-label={`Фото ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.name}</h3>
                <p className={styles.productDescription}>
                  {product.description?.type || ''}
                </p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>
                    {typeof product.price === 'number' ? product.price.toFixed(3) : product.price} ₽
                  </span>
                  <button
                    className={styles.productButton}
                    onClick={() => handleRedirect(product.slug)}

                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно */}
      {modalOpen && activeProduct && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              ×
            </button>

            <div className={styles.productDetails}>
              <h2>{activeProduct.name}</h2>
              <p className={styles.productPrice}>
                {typeof activeProduct.price === 'number'
                  ? activeProduct.price.toFixed(3)
                  : activeProduct.price} ₽
              </p>

              {activeProduct.photos && activeProduct.photos.length > 0 && (
                <div className={styles.productImages}>
                  {activeProduct.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={`/api/static/media/${activeProduct.photos[0]}`}
                      alt={`${activeProduct.name} ${idx + 1}`}
                      className={styles.detailImage}
                    />
                  ))}
                </div>
              )}

              <p className={styles.productAbout}>{activeProduct.about}</p>

              {activeProduct.description && (
                <div className={styles.productSpecs}>
                  <h3>Характеристики:</h3>
                  <p><strong>Тип:</strong> {activeProduct.description.type || 'Не указан'}</p>
                  <p><strong>Цвет:</strong> {activeProduct.description.color || 'Не указан'}</p>
                  <p><strong>Объем:</strong> {activeProduct.description.volume || 'Не указан'}</p>
                  <p><strong>Диаметр:</strong> {activeProduct.description.diameter || 'Не указан'}</p>
                  <p><strong>Особенности:</strong> {activeProduct.description.specificity || 'Не указан'}</p>
                </div>
              )}

              <button
                className="button"
                onClick={() => handleRedirect(activeProduct.slug)}
              >
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}