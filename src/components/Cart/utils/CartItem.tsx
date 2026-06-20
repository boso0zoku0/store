import {useRef, useState} from "react";
import styles from "../CartMobile.module.css";

interface CartItemProps {
  onRemove: () => void;
  name: string;
  price: number;
  photo: string;
}

export function CartItem({onRemove, name, price, photo}: CartItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const isRemovingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRemovingRef.current) return;
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRemovingRef.current) return;

    const diff = e.touches[0].clientX - startX.current;

    if (diff < 0) {
      e.preventDefault();

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        setSwipeX(Math.max(diff, -100));
      });
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    if (swipeX < -50) {
      isRemovingRef.current = true;
      setIsRemoving(true);
    } else {
      setSwipeX(0);
    }
  };

  const handleTransitionEnd = () => {
    if (isRemovingRef.current) {
      onRemove();
    }
  };

  return (
    <div
      className={`${styles.prodWrap} ${isRemoving ? styles.removing : ''} ${isSwiping ? styles.swiping : ''}`}
      style={{
        transform: `translateX(${swipeX}px)`,
        backgroundImage: photo ? `url("/api/static/media/${photo}")` : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTransitionEnd={handleTransitionEnd}
    >
      <span className={styles.prodName}>{name}</span>
      <span className={styles.prodPrice}>{price} ₽</span>
    </div>
  );
}