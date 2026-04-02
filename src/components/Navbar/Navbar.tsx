import styles from "./Navbar.module.css"
import {useAuth} from "../../contexts/AuthContexts.tsx";

export default function Navbar() {
  const {isAuthenticated, user, isLoading, logout} = useAuth();
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
          {isAuthenticated ? (<a href="/profile" aria-label="Профиль">
            Профиль
          </a>) : (
            <a href="/profile" aria-label="Профиль">Войти</a>
          )}

        </div>
      </div>
    </nav>
  )
}