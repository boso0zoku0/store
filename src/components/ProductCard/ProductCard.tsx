import styles from './ProductCard.module.css'
import {useState, useRef, useEffect, useMemo} from 'react';
import axios from "axios";
import type {CartItem} from "../interfaces.tsx";
import LoginModal from "../Auth/Modal/Login.tsx";
import ProductFilters from "../ProductFulter/Filter.tsx";
import type {FilterState} from "../ProductFulter/Filter.tsx";
import {ProductStatus} from "./interfaces.tsx"
import {useQuery} from "@tanstack/react-query";

export default function ProductCards() {
  const [activeProduct, setActiveProduct] = useState<CartItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isReqLogin, setIsReqLogin] = useState(false)
  const [priceFilterEnabled, setPriceFilterEnabled] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    volume: [],
    colors: [],
    priceRange: [0, 12000],
    inStock: true,
  });
  const [hoverStates, setHoverStates] = useState<Record<number, boolean>>({});
  const [imageIndices, setImageIndices] = useState<Record<number, number>>({});

  const { data: products, isLoading, isFetching } = useQuery<CartItem[]>({
    queryKey: ['products', filters, priceFilterEnabled],
    queryFn: async () => {
      const filtersToSend = { ...filters };

      // Удаляем пустые фильтры
      if (!filters.categories || filters.categories.length === 0) {
      delete filtersToSend.categories;
     }

      // Если объём не выбран — удаляем поле
      if (!filters.volume || filters.volume.length === 0) {
        delete filtersToSend.volume;
      }
      if (!filters.colors || filters.colors.length === 0) {
        delete filtersToSend.colors;
      }

      // Если фильтр по цене отключён — удаляем priceRange
      if (!priceFilterEnabled) {
        delete filtersToSend.priceRange;
      }
      const hasFilters = Object.keys(filtersToSend).length > 0;
      if (hasFilters) {
        console.log('📡 Запрос с фильтрами:', filtersToSend);
        const { data } = await axios.post('/api/products/filters/', filtersToSend, {
          withCredentials: true
        });
        return data;
      } else {
        console.log('📡 Запрос всех продуктов');
        const { data } = await axios.get('/api/products/', {
          withCredentials: true
        });
        return data;
      }
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };



  const handleAuth = async (slug: string, product_status: ProductStatus) => {
    try {

      await axios.post(`/api/products/add/to-cart`,
        {slug, product_status},
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


  if (isReqLogin) {
    return (
      <LoginModal isOpen={isReqLogin} onClose={() => setIsReqLogin(false)}/>
    )
  }
  const handlePriceFilterToggle = (enabled: boolean) => {
    console.log(`Переключили : ${enabled}`)
    setPriceFilterEnabled(enabled);
  };

  if (isLoading) {
    <div>Загрузка...</div>
  }
  if (isFetching) {
    <div>Обновление...</div>
  }


  return (
    <>


      {/* Основной контент: фильтры + товары */}
      <div className={styles.catalogLayout}>
        {/* Блок фильтров */}
        <ProductFilters
          onFilterChange={handleFilterChange}
          priceFilterEnabled={priceFilterEnabled}
          onPriceFilterToggle={handlePriceFilterToggle}

        />

        {/* Сетка товаров */}
        <div className={styles.productsGrid}>
          {products && products.map((product) => {
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
                     {product.price.toLocaleString('de-DE')} ₽
                  </span>
                    <button
                      className={styles.productButton}
                      onClick={() => handleAuth(product.slug, ProductStatus.PROCESSING)}
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
                {activeProduct.price.toLocaleString('de-DE')} ₽
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
                onClick={() => handleAuth(activeProduct.slug, ProductStatus.PROCESSING)}
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