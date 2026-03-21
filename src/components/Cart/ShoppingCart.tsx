import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './shoppingCart.module.css';
import {showToast} from "../ToastCheckout/Toast.tsx";

// Тип для товара в корзине
interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export default function shoppingCart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = React.useState<CartItem[]>([
    {
      id: 1,
      title: 'Поделка из глины',
      price: 9990,
      quantity: 2,
      image: 'https://labirint42.ru/wp-content/uploads/2019/01/588834-1490687656.jpg'
    },
    {
      id: 2,
      title: 'Керамическая ваза',
      price: 12500,
      quantity: 1,
      image: 'https://example.com/vase.jpg'
    }
  ]);

  function handleRedirect() {
    showToast.success('🎉 Товар добавлен! Переход к оформлению...')
    navigate('/checkout')
  }

  // Подсчёт общей суммы
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? {...item, quantity: newQuantity} : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  if (cartItems.length === 0) {
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
            <div key={item.id} className={styles.cartItem}>
              <img
                src={item.image}
                alt={item.title}
                className={styles.cartItemImage}
              />

              <div className={styles.cartItemInfo}>
                <h3 className={styles.cartItemTitle}>{item.title}</h3>
                <span className={styles.cartItemPrice}>
                  {item.price.toLocaleString()} ₽
                </span>
              </div>

              <div className={styles.cartItemControls}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className={styles.cartItemTotal}>
                {(item.price * item.quantity).toLocaleString()} ₽
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => removeItem(item.id)}
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
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Сумма:</span>
            <span className={styles.summaryTotal}>
              {totalAmount.toLocaleString()} ₽
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