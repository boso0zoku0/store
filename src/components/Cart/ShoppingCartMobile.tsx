import React, {useEffect, useState} from 'react';
import styles from './shoppingCartMobile.module.css';
import {CartItem} from "./CartItem.tsx";
import api, {isAuthenticated} from "../../utils/auth.tsx";
import LoginModal from "../Auth/Modal/Login.tsx";


export default function OrderList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (isAuthenticated()) {
          const response = await api.get('/products/get/to-cart');
          setItems(response.data);
          setShowLogin(false);
        } else {
          setShowLogin(true);
          setItems([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки корзины:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (id: number) => {
    try {
      await api.delete(`/products/delete?product_id=${id}`);
      setItems(prev => prev.filter(item => item.Products.id !== id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const filteredItems = items.filter(item =>
    item.Products.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (showLogin) {
    return <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)}/>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.btnSearch}>Найти</button>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyCart}>Корзина пуста</div>
      ) : (
        <>
          {filteredItems.map(item => (
            <CartItem
              key={item.Products.id}
              name={item.Products.name}
              price={item.Products.price}
              photo={item.Products.photos?.[0]}
              onRemove={() => handleRemove(item.Products.id)}
            />
          ))}
          <div className={styles.pay}>
            <button>Оплатить</button>
          </div>
        </>
      )}
    </div>
  );
}