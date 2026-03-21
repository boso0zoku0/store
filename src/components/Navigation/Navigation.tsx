import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, ChevronDown, Menu, X } from 'lucide-react';
import styles from './Navigation.module.css';

interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

export default function Navigation() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(2);

  // Категории для выпадающего меню
  const categories: NavItem[] = [
    {
      title: 'Категории',
      path: '/categories',
      children: [
        { title: 'Посуда ручной работы', path: '/categories/handmade' },
        { title: 'Керамика', path: '/categories/ceramics' },
        { title: 'Гончарные изделия', path: '/categories/pottery' },
        { title: 'Декор для дома', path: '/categories/decor' },
        { title: 'Подарочные наборы', path: '/categories/gifts' },
      ]
    },
    {
      title: 'Коллекции',
      path: '/collections',
      children: [
        { title: 'Весна 2024', path: '/collections/spring' },
        { title: 'Этно-стиль', path: '/collections/ethno' },
        { title: 'Минимализм', path: '/collections/minimal' },
        { title: 'Премиум', path: '/collections/premium' },
      ]
    }
  ];

  // Отслеживание скролла
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие мобильного меню при смене маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdown && !(e.target as Element).closest(`.${styles.dropdown}`)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>

        {/* Логотип */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>ClayShop</span>
          <span className={styles.logoBadge}>handmade</span>
        </Link>

        {/* Десктопное меню */}
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link
              to="/"
              className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
            >
              Главная
            </Link>
          </li>

          {/* Категории с выпадающим меню */}
          {categories.map((category) => (
            <li
              key={category.path}
              className={`${styles.navItem} ${styles.dropdown}`}
              onMouseEnter={() => setActiveDropdown(category.path)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={category.path}
                className={`${styles.navLink} ${styles.dropdownTrigger} ${
                  location.pathname.startsWith(category.path) ? styles.active : ''
                }`}
              >
                {category.title}
                <ChevronDown
                  size={16}
                  className={`${styles.dropdownIcon} ${
                    activeDropdown === category.path ? styles.rotated : ''
                  }`}
                />
              </Link>

              {/* Выпадающее меню */}
              {activeDropdown === category.path && (
                <ul className={styles.dropdownMenu}>
                  {category.children?.map((child) => (
                    <li key={child.path}>
                      <Link
                        to={child.path}
                        className={`${styles.dropdownItem} ${
                          location.pathname === child.path ? styles.active : ''
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          <li className={styles.navItem}>
            <Link
              to="/about"
              className={`${styles.navLink} ${location.pathname === '/about' ? styles.active : ''}`}
            >
              О нас
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/contacts"
              className={`${styles.navLink} ${location.pathname === '/contacts' ? styles.active : ''}`}
            >
              Контакты
            </Link>
          </li>
        </ul>

        {/* Поиск и иконки пользователя */}
        <div className={styles.actions}>
          <button className={styles.searchBtn} aria-label="Поиск">
            <Search size={20} />
          </button>

          <Link to="/profile" className={styles.profileBtn} aria-label="Профиль">
            <User size={20} />
          </Link>

          <Link to="/cart" className={styles.cartBtn} aria-label="Корзина">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          {/* Кнопка мобильного меню */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Меню"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNavList}>
            <li className={styles.mobileNavItem}>
              <Link to="/" className={styles.mobileNavLink}>Главная</Link>
            </li>

            {categories.map((category) => (
              <li key={category.path} className={styles.mobileNavItem}>
                <div
                  className={styles.mobileCategoryHeader}
                  onClick={() => setActiveDropdown(
                    activeDropdown === category.path ? null : category.path
                  )}
                >
                  <Link
                    to={category.path}
                    className={styles.mobileNavLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category.title}
                  </Link>
                  <ChevronDown
                    size={18}
                    className={`${styles.mobileDropdownIcon} ${
                      activeDropdown === category.path ? styles.rotated : ''
                    }`}
                  />
                </div>

                {activeDropdown === category.path && (
                  <ul className={styles.mobileDropdown}>
                    {category.children?.map((child) => (
                      <li key={child.path}>
                        <Link to={child.path} className={styles.mobileDropdownItem}>
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li className={styles.mobileNavItem}>
              <Link to="/about" className={styles.mobileNavLink}>О нас</Link>
            </li>
            <li className={styles.mobileNavItem}>
              <Link to="/contacts" className={styles.mobileNavLink}>Контакты</Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}