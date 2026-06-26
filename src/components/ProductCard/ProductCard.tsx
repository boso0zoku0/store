import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  openModal,
  truncateText
} from '../Products/utils';
import type {CartItem} from "../interfaces.tsx";

interface ProductCardProps {
  product: CartItem;
  isMobile: boolean;
  setOpenedProduct: (product: CartItem) => void;
  setOpenModalProduct: (isOpen: boolean) => void;
}

const ProductCard = memo(({
  product,
  isMobile,
  setOpenedProduct,
  setOpenModalProduct,
}: ProductCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const photos = product.photos || [];

  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => {
    setIsHovering(false);
    setCurrentIndex(0);
  };

  const onPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const onNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div
      className='productCard'
      onMouseEnter={!isMobile ? onMouseEnter : undefined}
      onMouseLeave={!isMobile ? onMouseLeave : undefined}
      onClick={isMobile ? () => navigate(`/product/${product.id}`) : undefined}
    >
      {!isMobile && (
        <>
          <div className='cardBorder'/>
          <div className='cardGlow'/>
        </>
      )}

      <div className='productImageWrapper'>
        {isHovering && photos.length > 1 && (
          <>
            <button
              className='arrow arrowLeft'
              onClick={onPrevImage}
            >
              ‹
            </button>
            <button
              className='arrow arrowRight'
              onClick={onNextImage}
            >
              ›
            </button>
          </>
        )}
        <img
          className='productImage'
          src={photos[currentIndex] || '/placeholder.jpg'}
          alt={product.name}
          loading="lazy"
          onClick={!isMobile ? () => openModal(product, setOpenedProduct, setOpenModalProduct) : undefined}
        />
      </div>

      <div className='productInfo'>
        <h3
          className={`productTitle ${isHovering && 'onHover'}`}
          onClick={!isMobile ? () => navigate(`/product/${product.id}`) : undefined}
        >
          {!isMobile && isHovering ? (
            <span>О товаре</span>
          ) : (
            <span>{truncateText(product.name)}</span>
          )}
        </h3>
      </div>
    </div>
  );
});

export default ProductCard;