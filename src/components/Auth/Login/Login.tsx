import {useState} from 'react';

import styles from './Login.module.css';
import Stars from "./Stars.tsx";

import LoginHelper from "./LoginHelper.tsx";

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  console.log('rerender')



  return (
    <div className={styles.container}>
      <Stars/>
      <div className={`${styles.cloud} ${styles.cloud1}`} />
      <div className={`${styles.cloud} ${styles.cloud2}`} />
      <div className={styles.mountains} />
      <div className={styles.card}>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.subtitle}>Введите свои данные для входа в аккаунт</p>

        {error && <div className={styles.error}>{error}</div>}

        <LoginHelper setError={setError} setIsLoading={setIsLoading} isLoading={isLoading}/>

        <p className={styles.registerLink}>
          Нет аккаунта?{' '}
          <a href="/register" className={styles.link}>Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}