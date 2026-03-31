// pages/Profile.tsx
import {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';
import {Mail, Phone, Calendar, Package, Heart, Settings, LogOut, Edit, MessageCircle, Clock} from 'lucide-react';
import styles from './Profile.module.css';
import axios from "axios";
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';

interface OrderData {
  id: number;
  short_name: string;
  status: 'processing' | 'moving' | 'completed' | 'cancelled' | 'none'
  created_at: string;
  price: number;
  photo: string[];
  quantity: number;
}


interface GeneralData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  date_registration: string;
  total_orders: number;
  total_price: number;
  products_info: OrderData[];
}

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders');


  const {data, isLoading} = useQuery<GeneralData>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await axios.get('/api/users/get', {
        withCredentials: true
      });
      return response.data
    },
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

  const handleContactArtist = () => {
    console.log('Связаться с автором');
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
                <div className={styles.stat}>
                  <Package size={16}/>
                  <span>{data?.total_orders} заказов</span>
                </div>
                <span className={styles.totalSpent}>
                  {(data?.total_price ?? 0).toLocaleString('de-DE')} ₽
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.contactBtn} onClick={handleContactArtist}>
              <MessageCircle size={18}/>
              <span>Связаться с автором</span>
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={18}/>
            </button>
          </div>
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
    </div>
  );
}