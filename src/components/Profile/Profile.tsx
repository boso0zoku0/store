// pages/Profile.tsx
import {useEffect, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router-dom';
import {Calendar, Clock, Edit, Heart, LogOut, Mail, MessageCircle, Package, Phone, Settings} from 'lucide-react';
import styles from './Profile.module.css';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import api from "../../utils/auth.tsx";
import type {GeneralData} from "./interfaces.tsx";
import {useAuth} from "../../contexts/AuthContexts.tsx";
import WsFriendly from "../WebSocket/Friendly/Users.tsx";

export default function Profile() {
  const {user} = useAuth();           // из контекста
  const {id} = useParams();           // url(не обязательно наш)
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders');
  const [isOpenChat, setIsOpenChat] = useState(false)

  const isOwn = user?.url_id === id;

  const {data, isLoading} = useQuery<GeneralData>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get(`/users/get/${id}`);
      console.log(`USERS_ID - ${response.data}`)
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'недавно';
    return format(new Date(dateString), 'dd.MM.yyyy', {locale: ru});
  };


  const handleLogout = async () => {
    navigate('/');
  };

  const handleOpenChat = () => {
     setIsOpenChat(!isOpenChat)
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.claySpinner}/>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Фоновая текстура */}
      <div className={styles.bgTexture}/>

      <div className={styles.profileContent}>
        {/* Шапка профиля */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img src={data?.avatar || '/default-avatar.jpg'} alt={data?.name} className={styles.avatar}/>
              <button className={styles.editAvatarBtn}>
                <Edit size={16}/>
              </button>
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.username}>{data?.name}</h1>
              <div className={styles.userStats}>
                <div className={styles.stat}>
                  <Calendar size={16}/>
                  <span>С нами с {formatDate(data?.date_registration)}</span>
                </div>
                {isOwn && (
                  <>
                    <div className={styles.stat}>
                      <Package size={16}/>
                      <span>{data?.total_orders} заказов</span>
                    </div>
                    <span className={styles.totalSpent}>
                  {(data?.total_price ?? 0).toLocaleString('de-DE')} ₽
                </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {!isOwn && (
            <div className={styles.actions} onClick={handleOpenChat}>
              <button className={styles.contactBtn}>
                <MessageCircle size={18}/>
                <span>Написать сообщение</span>
              </button>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={18}/>
              </button>
            </div>
          )}
        </div>

        {/* Табы */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18}/>
            <span>История покупок</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart size={18}/>
            <span>Избранное</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18}/>
            <span>Настройки</span>
          </button>
        </div>

        {/* Контент */}
        <div className={styles.tabContent}>
          {activeTab === 'orders' && (
            <div className={styles.ordersList}>
              {data?.total_price === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyClayIcon}/>
                  <p>У вас пока нет заказов</p>
                  <button onClick={() => navigate('/products')} className={styles.shopBtn}>
                    Перейти в каталог
                  </button>
                </div>
              ) : (
                data?.products_info?.map((order, index) => (
                  <div key={`${order.id}-${index}`} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderDate}>
                          <Clock size={14}/>
                          {formatDate(order.created_at)}
                        </span>
                        <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                          {order.status === 'completed' && 'Доставлен'}
                          {order.status === 'moving' && 'В пути'}
                          {order.status === 'processing' && 'Обрабатывается'}
                          {order.status === 'cancelled' && 'Отменен'}
                          {order.status === 'none' && 'В очереди'}
                        </span>
                      </div>

                      <span className={styles.orderTotal}>
                        {(order.price ?? 0).toLocaleString()} ₽
                      </span>
                    </div>
                    <div className={styles.orderItem}>
                      <img src={`/api/static/media/${order.photo[0]}`} alt={order.short_name}
                           className={styles.orderImage}/>
                      <div className={styles.orderDetails}>
                        <h4>{order.short_name}</h4>
                        <p>{order.quantity} шт × {order.price.toLocaleString()} ₽</p>
                      </div>
                    </div>

                    <button className={styles.reorderBtn}>Заказать снова</button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className={styles.favoritesGrid}>
              <div className={styles.emptyState}>
                <Heart size={48} strokeWidth={1}/>
                <p>Избранное пусто</p>
                <button onClick={() => navigate('/products')} className={styles.shopBtn}>
                  Добавить товары
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={styles.settingsForm}>
              <h3>Контактная информация</h3>
              <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.inputWithIcon}>
                  <Mail size={18}/>
                  <input type="email" value={data?.email || 'Не указан'} readOnly/>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Телефон</label>
                <div className={styles.inputWithIcon}>
                  <Phone size={18}/>
                  <input type="tel" value={data?.phone || 'Не указан'} readOnly/>
                </div>
              </div>
              <button className={styles.editBtn}>Редактировать профиль</button>
            </div>
          )}
        </div>
      </div>
      {isOpenChat && id &&(
        <WsFriendly isOpen={isOpenChat} onClose={() => setIsOpenChat(false)} to_user={id}/>
      )}
    </div>
  );
}