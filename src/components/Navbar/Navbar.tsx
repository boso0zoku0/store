import styles from "./Navbar.module.css"
import {Envelope3DIcon} from "../../Icons/IconChat.tsx";
import WsFriendly from "../WebSocket/Friendly/Users.tsx";
import {useState} from "react";

export default function Navbar({isAuthenticated, isLoading, user}) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (isLoading) {
    return <div className="navRight">Загрузка...</div>;
  }

  return (
    <nav className={styles.menu}>
      <div className={styles.navContainer}>
        <ul className={styles.navLinks}>
          <li><a href="/products">Изделия</a></li>
          <li><a href="/cart">Корзина</a></li>
          <li><a href="/requisites">Реквизиты Разработчика</a></li>
        </ul>
        <div className={styles.navRight}>
          {isAuthenticated ? (<a href={`/profile/${user?.url_id}`} aria-label="Профиль">
            Профиль
          </a>) : (
            <a href="/login" aria-label="Профиль">Войти</a>
          )}
          <button className={styles.iconButton} onClick={() => setIsOpen(!isOpen)}>
            <Envelope3DIcon
              size={24}
              color="#d1c2ac"
              className={styles.navChat}
            />
          </button>
        </div>
      </div>
      {isOpen && (
        <WsFriendly isOpen={isOpen} onClose={() => setIsOpen(!isOpen)}/>
      )}
    </nav>
  )
}