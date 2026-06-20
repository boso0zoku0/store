import styles from "./Navbar.module.css"
import {Envelope3DIcon} from "../../Icons/IconChatWsFriendly.tsx";
import WsFriendly from "../WebSocket/Friendly/Users.tsx";
import React, {useEffect, useState} from "react";
import {User} from "lucide-react";
import {useWsFriendly} from "../../contexts/SocketFriendly.tsx";

export default function Navbar({isAuthenticated, user}) {
  const [isOpen, setIsOpen] = useState(false)
  const {isNewMessage} = useWsFriendly()
  console.log('🔔 Navbar rendered, isNewMessage:', isNewMessage)

  return (
    <nav className={styles.menu}>
      <div className={styles.navContainer}>
        <ul className={styles.navLinks}>
          <li><a href="/products">Изделия</a></li>
          <li><a href="/cart">Корзина</a></li>
        </ul>
        <div className={styles.navRight}>
          {isAuthenticated ? (<a href={`/profile/${user?.url_id}`} aria-label="Профиль">
            <User color="#d1c2ac" size={24}/>
          </a>) : (
            <a href="/login" aria-label="Профиль">Войти</a>
          )}
          <button className={styles.iconButton} onClick={() => setIsOpen(!isOpen)}>
            <Envelope3DIcon
              size={24}
              color="#d1c2ac"
              className={styles.navChat}
              hasNotification={isNewMessage}
            />
          </button>
        </div>
      </div>
      {isOpen && (
        <WsFriendly isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} isMainEntrance={true}/>
      )}
    </nav>

  )
}