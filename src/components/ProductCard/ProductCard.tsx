import styles from './ProductCard.module.css'
import {useNavigate} from "react-router-dom";
import {useState, useRef, useEffect} from 'react';
import axios from "axios";
import type {CartItem} from "../interfaces.tsx";
import LoginModal from "../Auth/Modal/Login.tsx";

export default function ProductCards() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<CartItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchEnable, setSearchEnable] = useState('')
  const [tip, setTip] = useState<CartItem[]>([])
  const [load, setLoad] = useState(true)
  const [isReqLogin, setIsReqLogin] = useState(false)

  const [hoverStates, setHoverStates] = useState<Record<number, boolean>>({});
  const [imageIndices, setImageIndices] = useState<Record<number, number>>({});
  useEffect(() => {
    axios.post(`/api/products/find?short_name=${searchEnable}`, {withCredentials: true})
      .then((resp) => {
        setTip(resp.data);
        console.log('TIP:', resp.data); // ← логируем ответ, не состояние
      })
      .then(() => setLoad(false))
      .catch(err => console.error(err));
  }, [searchEnable]);
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
  const handleAuth = async (slug: string) => {
    try {
      await axios.post(`/api/products/add/to-cart?slug=${slug}`,
        {withCredentials: true}
      );
      setIsReqLogin(false)
      window.open('/cart', '_blank')
    } catch (error) {
      if (error.status == 401) {
        setIsReqLogin(true)
      }
    }
  };

const truncateText = (text: string) => {
  return text.length > 50
    ? `${text.slice(0, 50)}...`
    : text;
};

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
  if (isReqLogin) {
    return (
      <LoginModal isOpen={isReqLogin} onClose={() => setIsReqLogin(false)}/>
    )
  }

  return (
    <>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск товаров..."
          value={searchEnable}
          onChange={(e) => setSearchEnable(e.target.value)}
        />
      </div>
      {/*{tip.length > 0 && !load &&(*/}
      {/*  <div className={styles.searchSuggestions}>*/}
      {/*    {tip.map((item) => (*/}
      {/*      <div key={item.id} className={styles.suggestionItem}>*/}
      {/*        {item.photos && item.photos[0] && (*/}
      {/*          <img*/}
      {/*            src={`/api/static/media/${item.photos[0]}`}*/}
      {/*            alt={item.shortName || item.name}*/}
      {/*            className={styles.suggestionImage}*/}
      {/*          />*/}
      {/*        )}*/}
      {/*        <div className={styles.suggestionInfo}>*/}
      {/*          <span className={styles.suggestionName}>*/}
      {/*          {item.shortName || item.name}*/}
      {/*          </span>*/}
      {/*          <span className={styles.suggestionPrice}>{item.price} ₽</span>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*)}*/}
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
                  onClick={() => openModal(product)}
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
                <h3 className={styles.productTitle}>{truncateText(product.name)}</h3>
                <p className={styles.productDescription}>
                  {product.description?.type || ''}
                </p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>
                    {typeof product.price === 'number' ? product.price.toFixed(3) : product.price} ₽
                  </span>
                  <button
                    className={styles.productButton}
                    onClick={() => handleAuth(product.slug)}


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
                onClick={() => handleAuth(activeProduct.slug)}
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