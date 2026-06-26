import './Products.css'
import {useState, useEffect} from 'react';
import {type CartItem, ProductStatus} from "../interfaces.tsx";
import LoginModal from "../Auth/Modal/Login.tsx";
import type FilterState from "../ProductFulter/Filter.tsx";
import {useQuery} from "@tanstack/react-query";
import api from "../../utils/auth.tsx";
import gsap from 'gsap';
import {useAuth} from "../../contexts/Auth.tsx";
import {closeModal, handleAddProduct} from "./utils.tsx";
import {useMediaQuery} from "react-responsive";
import ProductCard from "../ProductCard/ProductCard.tsx";

interface FilterState {
  categories: string[];
  volume: number[];
  colors: string[];
  priceRange: number[];
  inStock: boolean;
}

export default function Products() {
  const {isAuthenticated} = useAuth()
  const [modalLogin, setModalLogin] = useState<Boolean>(false)
  const [openedProduct, setOpenedProduct] = useState<CartItem | null>(null);
  const [isOpenModalProduct, setOpenModalProduct] = useState<boolean>(false);
  const [priceFilterEnabled, setPriceFilterEnabled] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    volume: [],
    colors: [],
    priceRange: [0, 12000],
    inStock: true,
  });
  const isMobile = useMediaQuery({maxWidth: 768})
  console.log('rerender')

  const {data: products, isLoading} = useQuery<CartItem[]>({
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
        `.productCard`,
        {opacity: 0, y: 50, scale: 0.9},
        {opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(0.6)'}
      );
    }
  }, [products, isLoading]);


  if (!isAuthenticated) {
    return <LoginModal isOpen={modalLogin} onClose={() => setModalLogin(false)}/>;
  }

  if (isLoading) {
    return <div className='loader'>Загрузка товаров...</div>;
  }

  return (
    <>
      {products && products.map((product) => (
        <ProductCard
          product={product}
          isMobile={isMobile}
          setOpenedProduct={setOpenedProduct}
          setOpenModalProduct={setOpenModalProduct}
        />
      ))}

      {/* Модальное окно */}
      {!isMobile && isOpenModalProduct && openedProduct && (
        <div className='modalOverlay' onClick={() => closeModal(setOpenModalProduct, setOpenedProduct)}>
          <div className='modalContent' onClick={(e) => e.stopPropagation()}>
            <button className='modalClose' onClick={() => closeModal(setOpenModalProduct, setOpenedProduct)}>×</button>
            <div className='productDetails'>
              <h2>{openedProduct.name}</h2>
              {openedProduct.photos && openedProduct.photos.length > 0 && (
                <div className='productImages'>
                  {openedProduct.photos.map((photo, idx) => (
                    <img
                      key={idx} src={photo}
                      alt={openedProduct.name} className='detailImage'
                    />
                  ))}
                </div>
              )}
              <p>{openedProduct.about}</p>
              {openedProduct.description && (
                <div className='productSpecs'>
                  <h3>Характеристики:</h3>
                  <p><strong>Тип:</strong> {openedProduct.description.type || 'Не указан'}</p>
                  <p><strong>Цвет:</strong> {openedProduct.description.color || 'Не указан'}</p>
                  <p><strong>Объем:</strong> {openedProduct.description.volume || 'Не указан'}</p>
                  <p><strong>Диаметр:</strong> {openedProduct.description.diameter || 'Не указан'}</p>
                  <p><strong>Особенности:</strong> {openedProduct.description.specificity || 'Не указан'}</p>
                </div>
              )}
              <button className="button"
                      onClick={() => handleAddProduct(openedProduct.slug, ProductStatus.PROCESSING, setModalLogin)}>
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}