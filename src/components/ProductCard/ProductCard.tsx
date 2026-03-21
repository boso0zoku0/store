import styles from './ProductCard.module.css'
import {useNavigate} from "react-router-dom";
import { useState, useRef, useEffect } from 'react';

export default function ProductCards() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Массив изображений для карусели
  const images = [
    "https://labirint42.ru/wp-content/uploads/2019/01/588834-1490687656.jpg",
    "https://static.tildacdn.com/tild6231-3434-4633-a665-656163393734/DSC09569_2.png",
    "https://example.com/product-3.jpg",
  ];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCurrentImageIndex(0);
  };

  const handleRedirect = () => {
    navigate('/cart');
  };

  return (
    <div className={styles.productsContainer}>
      <div
        className={styles.productCard}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.productImageWrapper}>
          {/* Стрелка назад */}
          {isHovering && images.length > 1 && (
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={handlePrevImage}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
          )}

          <img
            className={styles.productImage}
            src={images[currentImageIndex]}
            alt="Лепка_1"
            loading="lazy"
          />

          {/* Стрелка вперёд */}
          {isHovering && images.length > 1 && (
            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={handleNextImage}
              aria-label="Следующее фото"
            >
              ›
            </button>
          )}

          {/* Индикаторы (точки) */}
          {isHovering && images.length > 1 && (
            <div className={styles.blinkingCursor}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Фото ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productTitle}>Поделка из глины</h3>
          <p className={styles.productDescription}>
            Сделана из качественного материала
          </p>
          <div className={styles.productFooter}>
            <span className={styles.productPrice}>9 990 ₽</span>
            <button className={styles.productButton} onClick={handleRedirect}>
              В корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  )}