import styles from './ProductCard.module.css'
import {useState, useEffect} from 'react';
import type {CartItem} from "../interfaces.tsx";
import LoginModal from "../Auth/Modal/Login.tsx";
import ProductFilters from "../ProductFulter/Filter.tsx";
import type FilterState from "../ProductFulter/Filter.tsx";
import {ProductStatus} from "./interfaces.tsx"
import {useQuery} from "@tanstack/react-query";
import api from "../../utils/auth.tsx";
import gsap from 'gsap';

interface FilterState {
  categories: string[];
  volume: number[];
  colors: string[];
  priceRange: number[];
  inStock: boolean;
}

export default function ProductCards() {
  const [activeProduct, setActiveProduct] = useState<CartItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isReqLogin, setIsReqLogin] = useState(false);
  const [priceFilterEnabled, setPriceFilterEnabled] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    volume: [],
    colors: [],
    priceRange: [0, 12000],
    inStock: true,
  });
  const [hoverStates, setHoverStates] = useState<Record<number, boolean>>({});
  const [imageIndices, setImageIndices] = useState<Record<number, number>>({});

  const {data: products, isLoading, isFetching} = useQuery<CartItem[]>({
    queryKey: ['products', filters, priceFilterEnabled],
    queryFn: async () => {
      const filtersToSend = {...filters};

      if (!filters.categories?.length) delete filtersToSend.categories;
      if (!filters.volume?.length) delete filtersToSend.volume;
      if (!filters.colors?.length) delete filtersToSend.colors;
      if (!priceFilterEnabled) delete filtersToSend.priceRange;

      const hasFilters = Object.keys(filtersToSend).length > 0;
      if (hasFilters) {
        const {data} = await api.post('/products/filters/', filtersToSend);
        return data;
      } else {
        const {data} = await api.get('/products');
        return data;
      }
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  // GSAP анимация карточек при загрузке
  useEffect(() => {
    if (products && products.length > 0 && !isLoading) {
      gsap.fromTo(
        `.${styles.productCard}`,
        {opacity: 0, y: 50, scale: 0.9},
        {opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(0.6)'}
      );
    }
  }, [products, isLoading]);

  const handleAuth = async (slug: string, product_status: ProductStatus) => {
    try {
      await api.post(`/products/add/to-cart`, {slug, product_status});
      setIsReqLogin(false);
      window.open('/cart');
    } catch (error: any) {
      if (error.status === 401) {
        setIsReqLogin(true);
      }
    }
  };

  const truncateText = (text: string) => text.length > 50 ? `${text.slice(0, 50)}...` : text;

  const handleMouseEnter = (productId: number) => {
    setHoverStates(prev => ({...prev, [productId]: true}));
  };

  const handleMouseLeave = (productId: number) => {
    setHoverStates(prev => ({...prev, [productId]: false}));
    setImageIndices(prev => ({...prev, [productId]: 0}));
  };

  const handlePrevImage = (e: React.MouseEvent, productId: number, photosLength: number) => {
    e.stopPropagation();

    setImageIndices(prev => {
      const current = prev[productId] ?? 0;  // 👈 значение по умолчанию 0
      const next = (current - 1 + photosLength) % photosLength;
      console.log(`Назад: текущий ${current} → новый ${next}`);
      return {...prev, [productId]: next};
    });
  };

  const handleNextImage = (e: React.MouseEvent, productId: number, photosLength: number) => {
    e.stopPropagation();

    setImageIndices(prev => {
      const current = prev[productId] ?? 0;  // 👈 значение по умолчанию 0
      const next = (current + 1) % photosLength;
      return {...prev, [productId]: next};
    });
  };


  const openModal = (product: CartItem) => {
    setActiveProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveProduct(null);
  };

  const handlePriceFilterToggle = (enabled: boolean) => {
    setPriceFilterEnabled(enabled);
  };

  if (isReqLogin) {
    return <LoginModal isOpen={isReqLogin} onClose={() => setIsReqLogin(false)}/>;
  }

  if (isLoading) {
    return <div className={styles.loader}>Загрузка товаров...</div>;
  }

  return (
    <>
      <div className={styles.catalogLayout}>
        <ProductFilters
          onFilterChange={setFilters}
          priceFilterEnabled={priceFilterEnabled}
          onPriceFilterToggle={handlePriceFilterToggle}
        />

        <div className={styles.productsGrid}>
          {products?.map((product) => {
            const isHovering = hoverStates[product.id] || false;
            const currentIndex = imageIndices[product.id] ?? 0;
            const photos = product.photos || [];

            return (
              <div
                key={product.id}
                className={styles.productCard}
                onMouseEnter={() => handleMouseEnter(product.id)}
                onMouseLeave={() => handleMouseLeave(product.id)}
              >
                {/* Анимированная переливающаяся рамка */}
                <div className={styles.cardBorder}/>
                <div className={styles.cardGlow}/>

                <div className={styles.productImageWrapper}>
                  {isHovering && photos.length > 1 && (
                    <>
                      <button
                        className={`${styles.arrow} ${styles.arrowLeft}`}
                        onClick={(e) => handlePrevImage(e, product.id, photos.length)}
                      >
                        ‹
                      </button>
                      <button
                        className={`${styles.arrow} ${styles.arrowRight}`}
                        onClick={(e) => handleNextImage(e, product.id, photos.length)}
                      >
                        ›
                      </button>
                    </>
                  )}

                  <img
                    className={styles.productImage}
                    src={photos[currentIndex] ? `/api/static/media/${photos[currentIndex]}` : '/placeholder.jpg'}
                    alt={product.name}
                    loading="lazy"
                    onClick={() => openModal(product)}
                  />

                  {isHovering && photos.length > 1 && (
                    <div>
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{truncateText(product.name)}</h3>
                  <p className={styles.productDescription}>{product.description?.type || ''}</p>
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>{product.price.toLocaleString('de-DE')} ₽</span>
                    <button className={styles.productButton}
                            onClick={() => handleAuth(product.slug, ProductStatus.PROCESSING)}>
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
            <button className={styles.modalClose} onClick={closeModal}>×</button>
            <div className={styles.productDetails}>
              <h2>{activeProduct.name}</h2>
              <p className={styles.productPrice}>{activeProduct.price.toLocaleString('de-DE')} ₽</p>
              {activeProduct.photos && activeProduct.photos.length > 0 && (
                <div className={styles.productImages}>
                  {activeProduct.photos.map((photo, idx) => (
                    <img key={idx} src={`/api/static/media/${photo}`} alt={`${activeProduct.name} ${idx + 1}`}
                         className={styles.detailImage}/>
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
              <button className="button"
                      onClick={() => handleAuth(activeProduct.slug, ProductStatus.PROCESSING)}>Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}