import { useState } from 'react';
import styles from './Login.module.css'; // или добавьте стили в ваш основной CSS

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLogin = () => {
    // Логика редиректа на страницу логина
    window.location.href = '/login';
    // или используйте navigate если есть роутинг
    // navigate('/login');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>

        <div className={styles.modalIcon}>🔒</div>

        <h2 className={styles.modalTitle}>Требуется авторизация</h2>

        <p className={styles.modalText}>
          Чтобы продолжить, пожалуйста, войдите в свой аккаунт
        </p>

        <div className={styles.modalButtons}>
          <button className={styles.modalButtonPrimary} onClick={handleLogin}>
            Войти
          </button>
          <button className={styles.modalButtonSecondary} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;