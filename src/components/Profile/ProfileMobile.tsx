import styles from './ProfileMobile.module.css'
import testAvatar from '../../assets/testAvatar.jpg';
import {Settings} from 'lucide-react';
import {useAuth} from "../../contexts/Auth.tsx";
import {useNavigate, useParams} from "react-router-dom";
import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {GeneralData} from "./interfaces.tsx";
import api from "../../utils/auth.tsx";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import WsFriendly from "../WebSocket/Friendly/Users.tsx";

export default function ProfileMobile() {
  const {user} = useAuth();           // из контекста
  const {id} = useParams();           // url(не обязательно наш)
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders');
  const [isOpenChat, setIsOpenChat] = useState(false)

  const isOwnProfile = user?.url_id === id;

  const {data, isLoading} = useQuery<GeneralData>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get(`/users/get/${id}`);
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

  if (isLoading) {
    return (
      <div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }
  return (
    <div className={styles.flexContainer}>
      <div className={styles.avatarSettings}>
        <img src={testAvatar} alt={data?.name} className={styles.avatar}/>
        <button className={styles.setting}><Settings/></button>
        <aside className={styles.user}>{data?.name}</aside>
      </div>
      {isOwnProfile && (
        <div className={styles.layoutBtns}>
          <div className={styles.layoutBtnH}>
            <button className="button">История покупок</button>
          </div>
          <div className={styles.layoutBtnF}>
            <button className="button">Избранное</button>
          </div>
        </div>
      )}
      {isOwnProfile ? (
        <div className={styles.infoOrders}>
          <span>Заказы: {data?.total_orders ?? 0}</span>
          <span>Сумма: {(data?.total_price ?? 0).toLocaleString('de-DE')} ₽</span>
        </div>
      ) : (
        <div>
          <button className="button" onClick={() => setIsOpenChat(!isOpenChat)}>
            Написать сообщение
          </button>
        </div>
      )}
      {data?.products_info && data.products_info.length > 0 ? (
        data?.products_info?.map((order, index) => (
          <div key={index} className={styles.containerContentBtnH}>
            <div className={styles.layoutColumn}>
              <aside className={styles.headerBtnH}>{order.short_name}</aside>
              <img alt="product" className={styles.productImg} src={`/api/static/media/${order.photo[0]}`}/>
            </div>
            {isOwnProfile && (
              <>
                <time className={styles.time}>{formatDate(order.created_at ?? '')}</time>
                <aside>{order.status ?? ''}</aside>
              </>
            )}
          </div>
        ))
      ) : (
        <div>
          <p>У вас пока нет заказов</p>
          <button onClick={() => navigate('/products')} className="btn">
            Перейти в каталог
          </button>
        </div>
      )}
      {isOpenChat && (
        <WsFriendly isOpen={isOpenChat} onClose={() => setIsOpenChat(!isOpenChat)} to_user={id}/>
      )}
    </div>
  )
}