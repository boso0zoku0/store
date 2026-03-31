import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './shoppingCart.module.css';
import {showToast} from "../ToastCheckout/Toast.tsx";
import axios from "axios";
import type {CartItem} from "./interfaces.tsx";
import Login from "../Auth/Modal/Login.tsx";


export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('/api/products/get/to-cart', {
          withCredentials: true
        });
        console.log(response.data)
        setCartItems(response.data);
        setLogin(false)


      } catch (err) {
        if (err.status === 401) {
          setLogin(true)
        }
        console.error('Ошибка загрузки корзины:', err);
        setError('Не удалось загрузить корзину');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);
  if (login) {
    return (<Login isOpen={login} onClose={() => setLogin(false)}/>)
  }

  const handleRedirect = () => {
    showToast.success('🎉 Переход к оформлению...');
    navigate('/checkout');
  };
  const handlePayment = (slug: string, stat: string) => {
    axios.post("/api/products/change/status",
      {slug, stat},
      {withCredentials: true}
    )
  }

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

  const removeItem = (slug: string, stat: string) => {
    axios.post('/api/products/change/status',
      {slug: slug, stat: stat},  // 👈 body
      {withCredentials: true}
    )
    setCartItems(items => items.filter(item => item.Products.slug !== slug));
    showToast.error(`${slug} удален из корзины`)
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
                  {(item.Products.price.toLocaleString('de-DE') || 0)} ₽
                </span>
              </div>

              <div className={styles.cartItemControls}>
                <span className={styles.quantity}>{item.quantity || 1}</span>
              </div>

              <div className={styles.cartItemTotal}>
                {((item.Products.price || 0) * (item.quantity || 1))} ₽
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => removeItem(item.Products.slug, 'cancelled')}
                aria-label="Удалить товар"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Блок с итогом и кнопкой оплаты */}
        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTotal}>Итого</h2>

          <div className={styles.summaryRow}>
            <span>Товаров:</span>
            <span>{cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)} шт</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Сумма:</span>
            <span className={styles.summaryTotal}>
              {totalAmount.toLocaleString('de-DE')} ₽
            </span>
          </div>

          <div className={styles.container}>
            <button
              className="btn"
              onClick={() => handleRedirect()}
            >
              Оплатить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}