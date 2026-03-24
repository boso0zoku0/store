import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './shoppingCart.module.css';
import {showToast} from "../ToastCheckout/Toast.tsx";
import axios from "axios";
import type {CartItem} from "./interfaces.tsx";


export default function ShoppingCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('/api/products/get/to-cart', {
          withCredentials: true
        });
        console.log(response.data)
        setCartItems(response.data);


      } catch (err) {
        console.error('Ошибка загрузки корзины:', err);
        setError('Не удалось загрузить корзину');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRedirect = () => {
    showToast.success('🎉 Переход к оформлению...');
    navigate('/checkout');
  };

  // Подсчёт общей суммы
  const totalAmount = cartItems.reduce((sum, item) => {
  const price = item.Products?.price || 0;
  const quantity = item.quantity || 0;
  const subtotal = price * quantity;
  console.log('price:', price, 'quantity:', quantity, 'subtotal:', subtotal);
  return sum + subtotal;
}, 0);
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.Products.id === id ? {...item, quantity: newQuantity} : item
      )
    );
  };

  const removeItem = (id: number) => {
    axios.delete(`/api/products/delete?product_id=${id}`, {withCredentials: true})
    setCartItems(items => items.filter(item => item.Products.id !== id));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка корзины...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  // Корзина пуста
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Корзина пуста</h2>
        <button
          className={styles.continueShopping}
          onClick={() => navigate('/products')}
        >
          Продолжить покупки
        </button>
      </div>
    );
  }
  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartContent}>
        {/* Список товаров */}
        <div className={styles.cartItems}>
          {cartItems.map(item => (
            <div key={item.Products.id} className={styles.cartItem}>
              <img
                src={
                  item.Products?.photos && item.Products.photos.length > 0
                    ? `/api/static/media/${item.Products.photos[0]}`
                    : '/placeholder.jpg'
                }
                alt={item.Products?.shortName}
                className={styles.cartItemImage}
              />

              <div className={styles.cartItemInfo}>
                <h3 className={styles.cartItemTitle}>{item.Products.slug || 'Без названия'}</h3>
                <span className={styles.cartItemPrice}>
                  {(item.Products.price || 0).toFixed(3)} ₽
                </span>
              </div>

              <div className={styles.cartItemControls}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.Products.id, (item.quantity || 1) - 1)}
                >
                  −
                </button>
                <span className={styles.quantity}>{item.quantity || 1}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.Products.id, (item.quantity || 1) + 1)}
                >
                  +
                </button>
              </div>

              <div className={styles.cartItemTotal}>
                {((item.Products.price || 0) * (item.quantity || 1)).toFixed(3)} ₽
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => removeItem(item.Products.id)}
                aria-label="Удалить товар"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Блок с итогом и кнопкой оплаты */}
        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Итого</h2>

          <div className={styles.summaryRow}>
            <span>Товаров:</span>
            <span>{cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)} шт</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Сумма:</span>
            <span className={styles.summaryTotal}>
              {totalAmount.toFixed(3)} ₽
            </span>
          </div>

          <div className={styles.container}>
            <button
              className={styles.checkoutBtn}
              onClick={handleRedirect}
            >
              Оплатить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}