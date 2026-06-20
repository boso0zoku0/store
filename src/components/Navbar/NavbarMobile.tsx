import styles from "./NavbarMobile.module.css"
import React, {useEffect, useState} from "react";
import {useWsFriendly} from "../../contexts/SocketFriendly.tsx";
import {Menu} from 'lucide-react';
import {Envelope3DIcon} from "../../Icons/IconChatWsFriendly.tsx";
import WsFriendly from "../WebSocket/Friendly/Users.tsx";
import {User} from "lucide-react";
import {CartIcon} from "../../Icons/CartIcon.tsx";
import {useNavigate} from "react-router-dom";
import {GiClayBrick} from "react-icons/gi";

export default function NavbarMobile({isAuthenticated, user}) {
  const [isOpenBurger, setIsOpenBurger] = useState(false)
  const [isOpenChat, setIsOpenChat] = useState(false)
  const {isNewMessage} = useWsFriendly()
  const navigate = useNavigate()

  return (
    <>
      <div className={styles.navbar}>
        <button className={styles.btnBurger} onClick={() => setIsOpenBurger(!isOpenBurger)}>
          <Menu size={24} strokeWidth={1.5}/>
        </button>
        {isOpenBurger && (
          <div className={styles.containerBurger}>
            <ul className={styles.burgerPages}>
              <li className={styles.page} onClick={() => {
                navigate(`/profile/${user?.url_id}`);
                setIsOpenBurger(false);
              }}>
                <User color="#d1c2ac" size={24}/>
                <span>Профиль</span>
              </li>
              <li className={styles.page} onClick={() => {
                navigate(`/products`);
                setIsOpenBurger(false);
              }}>
                <GiClayBrick color="#d1c2ac" size={24}/>
                <span>Главная</span>
              </li>
              <li className={styles.page} onClick={() => {
                navigate(`/cart`);
                setIsOpenBurger(false)
              }}>
                <CartIcon size={24}/>
                <span>Корзина</span>
              </li>
              <li className={styles.page} onClick={() => {
                setIsOpenChat(!isOpenChat);
                setIsOpenBurger(false);
              }}>
                <Envelope3DIcon
                  size={24}
                  color="#d1c2ac"
                  className={styles.navChat}
                  hasNotification={isNewMessage}
                />
                <span>Личные сообщения</span>
              </li>
            </ul>
          </div>
        )}
        {isAuthenticated ? (
            <a href={`/profile/${user?.url_id}`} aria-label="Профиль" className={styles.rightIcons}>
              <User color="#d1c2ac" size={24}/>
            </a>
          ) :
          (<a href="/login" aria-label="Профиль">Войти</a>)
        }
      </div>
      {isOpenChat && (
        <WsFriendly isOpen={isOpenChat} onClose={() => setIsOpenChat(!isOpenChat)} isMainEntrance={true}/>
      )}
    </>
  );
}

